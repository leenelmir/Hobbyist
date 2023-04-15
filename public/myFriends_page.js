// Get the sidebar element and the toggle button
const sidebar = document.getElementById('sidebar');
const toggleButton = document.getElementById('sidebar-toggle');

// Add a click event listener to the toggle button
toggleButton.addEventListener('click', function() {
  // Toggle the visibility of the sidebar
  if (sidebar.style.display === 'none') {
    sidebar.style.display = 'block';
  } else {
    sidebar.style.display = 'none';
  }
});

// Add a click event listener to each friend request list item
const friendRequests = document.querySelectorAll('#sidebar ul li');
friendRequests.forEach(function(request) {
  request.addEventListener('click', function() {
    // Do something when a friend request is clicked
    console.log('Clicked on friend request: ' + request.textContent);
  });
});
