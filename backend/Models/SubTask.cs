using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class SubTask
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public bool IsCompleted { get; set; } = false;

        public int TodoItemId { get; set; }

        [ForeignKey("TodoItemId")]
        [JsonIgnore] // Prevent cycles in JSON serialization
        public TodoItem? TodoItem { get; set; }
    }
}
