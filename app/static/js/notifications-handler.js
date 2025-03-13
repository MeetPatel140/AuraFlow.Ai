/**
 * AuraFlow.Ai - Notifications Handler
 * Handles notification panel and dropdown functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get references to the mark-all-read buttons with their new IDs
    const dropdownMarkAllReadBtn = document.getElementById('dropdown-mark-all-read');
    const panelMarkAllReadBtn = document.getElementById('panel-mark-all-read');
    
    // Function to mark all notifications as read
    function markAllNotificationsAsRead() {
        console.log('Marking all notifications as read');
        
        // Here you would typically make an API call to mark notifications as read
        // For now, we'll just simulate the behavior
        
        // Update notification badge
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            notificationBadge.textContent = '0';
        }
        
        // Update notification items in both dropdown and panel
        const notificationItems = document.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.classList.remove('unread');
            item.classList.add('read');
        });
        
        // Show success notification
        if (window.Notifications) {
            window.Notifications.success('All notifications marked as read');
        }
    }
    
    // Add event listeners to both buttons
    if (dropdownMarkAllReadBtn) {
        dropdownMarkAllReadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            markAllNotificationsAsRead();
        });
    }
    
    if (panelMarkAllReadBtn) {
        panelMarkAllReadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            markAllNotificationsAsRead();
        });
    }
    
    // Initialize notifications dropdown toggle
    const notificationsBtn = document.getElementById('notifications-btn');
    const notificationsDropdown = document.getElementById('notifications-dropdown');
    
    if (notificationsBtn && notificationsDropdown) {
        notificationsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationsDropdown.classList.toggle('active');
            
            // Close other dropdowns
            document.querySelectorAll('.topbar-dropdown-menu').forEach(dropdown => {
                if (dropdown !== notificationsDropdown && dropdown.classList.contains('active')) {
                    dropdown.classList.remove('active');
                }
            });
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.topbar-action-dropdown')) {
            document.querySelectorAll('.topbar-dropdown-menu').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}); 