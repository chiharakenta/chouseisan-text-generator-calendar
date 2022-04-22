const week = ["日", "月", "火", "水", "木", "金", "土"];
const today = new Date();
// 月末だとずれる可能性があるため、1日固定で取得
var showDate = new Date(today.getFullYear(), today.getMonth(), 1);

// 初期表示
window.onload = function () {
  showProcess(today, calendar);
};
// 前の月表示
function prev() {
  showDate.setMonth(showDate.getMonth() - 1);
  showProcess(showDate);
}

// 次の月表示
function next() {
  showDate.setMonth(showDate.getMonth() + 1);
  showProcess(showDate);
}

// カレンダー表示
function showProcess(date) {
  var year = date.getFullYear();
  var month = date.getMonth();
  document.querySelector("#header").innerHTML =
    year + "年 " + (month + 1) + "月";

  var calendar = createProcess(year, month);
  document.querySelector("#calendar").innerHTML = calendar;
}

// カレンダー作成
function createProcess(year, month) {
  // 曜日
  var calendar = "<table><tr class='dayOfWeek'>";
  for (var i = 0; i < week.length; i++) {
    calendar += "<th>" + week[i] + "</th>";
  }
  calendar += "</tr>";

  var count = 0;
  var startDayOfWeek = new Date(year, month, 1).getDay();
  var endDate = new Date(year, month + 1, 0).getDate();
  var lastMonthEndDate = new Date(year, month, 0).getDate();
  var row = Math.ceil((startDayOfWeek + endDate) / week.length);

  let monthSchedules = schedules.filter(
    (schedule) =>
      schedule.date.getFullYear() === year && schedule.date.getMonth() === month
  );

  // 1行ずつ設定
  for (var i = 0; i < row; i++) {
    calendar += "<tr>";
    // 1colum単位で設定
    for (var j = 0; j < week.length; j++) {
      let dateElement;
      if (i == 0 && j < startDayOfWeek) {
        // 1行目で1日まで先月の日付を設定
        dateElement =
          "<td class='disabled'>" +
          (lastMonthEndDate - startDayOfWeek + j + 1) +
          "</td>";
      } else if (count >= endDate) {
        // 最終行で最終日以降、翌月の日付を設定
        count++;
        dateElement = "<td class='disabled'>" + (count - endDate) + "</td>";
      } else {
        // 当月の日付を曜日に照らし合わせて設定
        count++;

        const isActive = monthSchedules.filter((monthSchedule) => {
          return (
            monthSchedule.date.getFullYear() === year &&
            monthSchedule.date.getMonth() === month &&
            monthSchedule.date.getDate() === count
          );
        }).length;
        if (isActive) {
          dateElement = `<td class='active' data-year=${year} data-month=${month} data-date=${count}>${count}</td>`;
        } else {
          dateElement = `<td data-year=${year} data-month=${month} data-date=${count}>${count}</td>`;
        }
      }
      calendar += dateElement;
    }
  }
  calendar += "</tr>";
  return calendar;
}

const schedules = [];

document.addEventListener("click", (event) => {
  if (event.target.tagName.toLowerCase() !== "td") return;
  if (event.target.classList.contains("disabled")) return;

  const { year, month, date } = event.target.dataset;

  if (event.target.classList.contains("active")) {
    event.target.classList.remove("active");
    const scheduleIndex = getScheduleIndexByDate(year, month, date);
    deleteScheduleByIndex(scheduleIndex);
  } else {
    event.target.classList.add("active");
    createSchedule(year, month, date);
  }

  renderScheduleText();
});

const getScheduleIndexByDate = (year, month, date) => {
  for (let i in schedules) {
    if (schedules[i].date.getTime() === new Date(year, month, date).getTime()) {
      return i;
    }
  }
};

const createSchedule = (year, month, date) => {
  schedules.push({
    date: new Date(year, month, date),
  });
};

const deleteScheduleByIndex = (index) => {
  schedules.splice(index, 1);
};

const renderScheduleText = () => {
  sortSchedulesAscending();
  let scheduleText = "";
  schedules.forEach((schedule) => {
    scheduleText = `${scheduleText}${schedule.date.getFullYear()}/${
      schedule.date.getMonth() + 1
    }/${schedule.date.getDate()}(${week[schedule.date.getDay()]})\n`;
  });
  document.getElementById("scheduleText").textContent = scheduleText;
};

const sortSchedulesAscending = () => {
  schedules.sort((a, b) => {
    if (a.date > b.date) {
      return 1;
    } else {
      return -1;
    }
  });
};
