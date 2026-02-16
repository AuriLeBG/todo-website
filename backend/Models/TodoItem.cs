using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class TodoItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public bool IsCompleted { get; set; } = false;

        public int UserId { get; set; }
        
        public DateTime? Deadline { get; set; }
        
        public Priority Priority { get; set; } = Priority.Medium;

        public string? Category { get; set; }

        public int OrderIndex { get; set; }

        public RecurrenceType Recurrence { get; set; } = RecurrenceType.None;

        public int? RecurrenceValue { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public ICollection<SubTask> SubTasks { get; set; } = new List<SubTask>();
    }
}
