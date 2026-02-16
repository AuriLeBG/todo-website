using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TodoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodos(int userId)
        {
            return await _context.TodoItems
                .Where(t => t.UserId == userId)
                .Include(t => t.SubTasks)
                .OrderBy(t => t.OrderIndex)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<TodoItem>> CreateTodo(TodoItem todo)
        {
            todo.OrderIndex = await _context.TodoItems.CountAsync(t => t.UserId == todo.UserId);
            _context.TodoItems.Add(todo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTodos), new { userId = todo.UserId }, todo);
        }

        // POST: api/Todo/{id}/subtasks
        [HttpPost("{id}/subtasks")]
        public async Task<ActionResult<SubTask>> PostSubTask(int id, SubTask subTask)
        {
            var todoItem = await _context.TodoItems.FindAsync(id);
            if (todoItem == null)
            {
                return NotFound();
            }

            subTask.TodoItemId = id;
            _context.SubTasks.Add(subTask);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTodos), new { userId = todoItem.UserId }, subTask);
        }

        // PUT: api/Todo/subtasks/{subTaskId}
        [HttpPut("subtasks/{subTaskId}")]
        public async Task<IActionResult> PutSubTask(int subTaskId, SubTask subTask)
        {
            if (subTaskId != subTask.Id)
            {
                return BadRequest();
            }

            _context.Entry(subTask).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.SubTasks.Any(e => e.Id == subTaskId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Todo/subtasks/{subTaskId}
        [HttpDelete("subtasks/{subTaskId}")]
        public async Task<IActionResult> DeleteSubTask(int subTaskId)
        {
            var subTask = await _context.SubTasks.FindAsync(subTaskId);
            if (subTask == null)
            {
                return NotFound();
            }

            _context.SubTasks.Remove(subTask);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTodo(int id, TodoItem todo)
        {
            if (id != todo.Id)
            {
                return BadRequest();
            }

            var existingTodo = await _context.TodoItems.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
            if (existingTodo == null)
            {
                return NotFound();
            }

            // Check for recurrence generation
            if (!existingTodo.IsCompleted && todo.IsCompleted && todo.Recurrence != RecurrenceType.None)
            {
                DateTime? newDeadline = todo.Deadline;
                var baseDate = todo.Deadline ?? DateTime.UtcNow;

                switch (todo.Recurrence)
                {
                    case RecurrenceType.Daily:
                        newDeadline = baseDate.AddDays(1);
                        break;

                    case RecurrenceType.Weekly:
                        newDeadline = baseDate.AddDays(7);
                        if (todo.RecurrenceValue.HasValue)
                        {
                             // Simple logic: if target day differs, find next.
                             // For now, keeping it simple as per previous logic or lack thereof.
                             // Assuming +7 days is sufficient for basic weekly.
                        }
                        break;

                    case RecurrenceType.Monthly:
                        newDeadline = baseDate.AddMonths(1);
                        break;
                }

                var nextTodo = new TodoItem
                {
                    Title = todo.Title,
                    UserId = todo.UserId,
                    Priority = todo.Priority,
                    Category = todo.Category,
                    Deadline = newDeadline,
                    Recurrence = todo.Recurrence,
                    RecurrenceValue = todo.RecurrenceValue,
                    IsCompleted = false,
                    OrderIndex = await _context.TodoItems.CountAsync(t => t.UserId == todo.UserId) // Add to end
                };
                _context.TodoItems.Add(nextTodo);
            }

            _context.Entry(todo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TodoItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPost("reorder")]
        public async Task<IActionResult> ReorderTodos([FromBody] List<int> todoIds)
        {
            var todos = await _context.TodoItems.Where(t => todoIds.Contains(t.Id)).ToListAsync();
            
            foreach (var todo in todos)
            {
                var index = todoIds.IndexOf(todo.Id);
                if (index != -1)
                {
                    todo.OrderIndex = index;
                }
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodo(int id)
        {
            var todo = await _context.TodoItems.FindAsync(id);
            if (todo == null)
            {
                return NotFound();
            }

            _context.TodoItems.Remove(todo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("stats/{userId}")]
        public async Task<ActionResult<object>> GetStats(int userId)
        {
            var todos = await _context.TodoItems
                .Where(t => t.UserId == userId)
                .ToListAsync();

            var totalCompleted = todos.Count(t => t.IsCompleted);
            var totalCount = todos.Count;
            var completionRate = totalCount > 0 ? (double)totalCompleted / totalCount * 100 : 0;

            // Category Distribution
            var categoryDistribution = todos
                .Where(t => t.IsCompleted && !string.IsNullOrEmpty(t.Category))
                .GroupBy(t => t.Category)
                .Select(g => new { Category = g.Key, Count = g.Count() })
                .ToList();

            // Completion Trend (Last 7 days)
            var last7Days = Enumerable.Range(0, 7)
                .Select(i => DateTime.UtcNow.Date.AddDays(-i))
                .OrderBy(d => d)
                .ToList();

            var completionTrend = last7Days.Select(date => new
            {
                Date = date.ToString("yyyy-MM-dd"),
                Count = todos.Count(t => t.IsCompleted && t.CreatedAt.Date == date)
            }).ToList();
            
            return new
            {
                totalCompleted,
                totalCount,
                completionRate,
                categoryDistribution,
                completionTrend
            };
        }

        private bool TodoItemExists(int id)
        {
            return _context.TodoItems.Any(e => e.Id == id);
        }
    }
}
