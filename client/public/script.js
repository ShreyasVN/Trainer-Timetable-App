document.addEventListener('DOMContentLoaded', function () {
  let calendarEl = document.getElementById('calendar');
  let calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: '/api/sessions',
    eventClick: function(info) {
      alert(`Course: ${info.event.title}\nTime: ${info.event.start}`);
    }
  });
  calendar.render();
});
