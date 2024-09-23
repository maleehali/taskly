// Retrieve tasks and nextId from localStorage, or initialize them if they don't exist
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
    let card = $(`
        <div class="card task-card mb-3" data-id="${task.id}">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small class="text-muted">Due: ${task.deadline}</small></p>
                <button class="btn btn-danger delete-task">Delete</button>
            </div>
        </div>
    `);

    // Apply color coding based on deadline
    let now = dayjs();
    let deadline = dayjs(task.deadline);
    if (deadline.isBefore(now, 'day')) {
        card.addClass('bg-danger'); // Overdue: red
    } else if (deadline.diff(now, 'day') <= 3) {
        card.addClass('bg-warning'); // Nearing deadline: yellow
    }

    return card;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    // Clear existing cards
    $("#todo-cards, #inprogress-cards, #done-cards").empty();

    taskList.forEach(task => {
        let card = createTaskCard(task);
        $(`#${task.status}-cards`).append(card);
    });

    // Make task cards draggable
    $(".task-card").draggable({
        revert: "invalid",
        containment: ".container",
        helper: "clone",
        zIndex: 100,
        start: function(event, ui) {
            $(ui.helper).css('z-index', 1000);  // Ensure the dragged item stays on top
        }
    });

    // Make lanes droppable
    $(".lane").droppable({
        accept: ".task-card",
        tolerance: "pointer",  // Ensures the task intersects the droppable area
        drop: function(event, ui) {
            let taskId = ui.helper.data("id");
            let newStatus = $(this).attr("id").split('-')[0];  // Adjusted to handle IDs without hyphen

            console.log("Dropped task ID:", taskId);
            console.log("New status:", newStatus);

            // Update task status
            taskList.forEach(task => {
                if (task.id === taskId) {
                    task.status = newStatus;
                }
            });

            // Save updated task list to localStorage
            localStorage.setItem("tasks", JSON.stringify(taskList));

            // Re-render the task list to move the task to the correct lane
            renderTaskList();
        }
    });
}


// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    let title = $("#taskTitle").val();
    let description = $("#taskDescription").val();
    let deadline = $("#taskDeadline").val();

    if (title && deadline) {
        let newTask = {
            id: generateTaskId(),
            title: title,
            description: description,
            deadline: deadline,
            status: "todo"
        };

        taskList.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        localStorage.setItem("nextId", JSON.stringify(nextId));

        renderTaskList();
        $("#formModal").modal('hide');
    }
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    let taskId = $(event.target).closest(".task-card").data("id");
    taskList = taskList.filter(task => task.id !== taskId);

    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function() {
    renderTaskList();

    $("#task-form").on("submit", handleAddTask);
    $(document).on("click", ".delete-task", handleDeleteTask);

    $("#taskDeadline").datepicker({
        dateFormat: "yy-mm-dd"
    });
});