const week = ["日", "月", "火", "水", "木", "金", "土"];
const today = new Date();
today.setHours(0, 0, 0, 0);
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
  switchModalButton();
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
      const thisDay = new Date(year, month, count + 1);
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
      } else if (thisDay.getTime() < today.getTime()) {
        count++;
        dateElement = "<td class='disabled'>" + count + "</td>";
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
          const isHoliday = JapaneseHolidays.isHoliday(thisDay);
          if (isHoliday) {
            dateElement = `<td class='holiday' data-year=${year} data-month=${month} data-date=${count}>${count}</td>`;
          } else {
            dateElement = `<td data-year=${year} data-month=${month} data-date=${count}>${count}</td>`;
          }
        }
      }
      calendar += dateElement;
    }
  }
  calendar += "</tr>";
  return calendar;
}

const schedules = [];
let scheduleType = "dayOnly";

document.addEventListener("click", (event) => {
  if (event.target.tagName.toLowerCase() !== "td") return;
  if (event.target.classList.contains("disabled")) return;

  const { year, month, date } = event.target.dataset;

  if (event.target.classList.contains("active")) {
    if (scheduleType === "dayOnly") {
      event.target.classList.remove("active");
      const scheduleIndex = getScheduleIndexByDate(year, month, date);
      deleteScheduleByIndex(scheduleIndex);
    }
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
    times: [],
  });
};

const deleteScheduleByIndex = (index) => {
  schedules.splice(index, 1);
};

const renderScheduleText = () => {
  sortSchedulesAscending();
  let scheduleText = "";
  if (scheduleType === "dayOnly") {
    schedules.forEach((schedule) => {
      scheduleText = `${scheduleText}${schedule.date.getFullYear()}/${
        schedule.date.getMonth() + 1
      }/${schedule.date.getDate()}(${week[schedule.date.getDay()]})\n`;
    });
  }
  if (scheduleType === "selectTime") {
    schedules.forEach((schedule) => {
      schedule.times.forEach((time) => {
        scheduleText = `${scheduleText}${schedule.date.getFullYear()}/${
          schedule.date.getMonth() + 1
        }/${schedule.date.getDate()}(${
          week[schedule.date.getDay()]
        }) ${time}:00~\n`;
      });
    });
  }
  if (scheduleType === "selectEveryHour") {
    schedules.forEach((schedule) => {
      schedule.times.forEach((time) => {
        scheduleText = `${scheduleText}${schedule.date.getFullYear()}/${
          schedule.date.getMonth() + 1
        }/${schedule.date.getDate()}(${
          week[schedule.date.getDay()]
        }) ${time}:00~${time + 1}:00\n`;
      });
    });
  }
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

const switchModalButton = () => {
  Array.from(document.getElementsByClassName("schedule-type")).forEach(
    (scheudleTypeElement) => {
      if (scheudleTypeElement.checked) {
        scheduleType = scheudleTypeElement.value;
      }
    }
  );
  const activeDates = Array.from(
    document.querySelectorAll("td:not(.disabled)")
  );
  if (scheduleType === "dayOnly") {
    activeDates.forEach((activeDate) => {
      activeDate.classList.remove("open-modal");
      activeDate.removeAttribute("data-bs-toggle");
      activeDate.removeAttribute("data-bs-target");
    });
  }
  if (scheduleType === "selectTime" || scheduleType === "selectEveryHour") {
    activeDates.forEach((activeDate) => {
      activeDate.classList.add("open-modal");
      activeDate.setAttribute("data-bs-toggle", "modal");
      activeDate.setAttribute("data-bs-target", "#exampleModal");
    });
  }
  renderScheduleText();
};
Array.from(document.getElementsByClassName("schedule-type")).forEach(
  (radio) => {
    radio.onchange = switchModalButton;
  }
);

document.addEventListener("click", (event) => {
  const isOpenModalButton = event.target.classList.contains("open-modal");
  if (!isOpenModalButton) return;

  const timeSchedule = document.getElementById("timeSchedule");
  // 中身を空にする
  if (timeSchedule.childElementCount) {
    timeSchedule.innerHTML = "";
  }

  const timeScheduleDate = document.createElement("div");
  const { year, month, date } = event.target.dataset;
  const modalDate = new Date(`${year}-${parseInt(month) + 1}-${date}`);
  timeScheduleDate.classList.add("h5");
  timeScheduleDate.classList.add("text-center");
  timeScheduleDate.textContent = `${modalDate.getFullYear()}/${
    modalDate.getMonth() + 1
  }/${modalDate.getDate()}(${week[modalDate.getDay()]})`;

  timeSchedule.appendChild(timeScheduleDate);
  for (let i = 0; i < 24; i++) {
    const timeScheduleButton = document.createElement("button");
    timeScheduleButton.classList.add(
      "d-block",
      "w-25",
      "mx-auto",
      "mb-1",
      "btn",
      "btn-outline-primary"
    );
    timeScheduleButton.onclick = selectTime;
    timeScheduleButton.dataset.year = modalDate.getFullYear();
    timeScheduleButton.dataset.month = modalDate.getMonth();
    timeScheduleButton.dataset.date = modalDate.getDate();
    timeScheduleButton.dataset.time = i;
    if (scheduleType === "selectTime") {
      timeScheduleButton.textContent = `${i}:00~`;
    }
    if (scheduleType === "selectEveryHour") {
      timeScheduleButton.textContent = `${i}:00~${i + 1}:00`;
    }

    timeSchedule.appendChild(timeScheduleButton);
  }
  const scheduleIndex = getScheduleIndexByDate(year, month, date);
  schedules[scheduleIndex].times.forEach((time) => {
    document
      .querySelector(`button[data-time='${time}']`)
      .classList.add("active");
  });
  document.getElementById("deselectSchedule").dataset.scheduleIndex =
    scheduleIndex;
  document.getElementById("deselectSchedule").onclick = () => {
    schedules.splice(scheduleIndex, 1);
    event.target.classList.remove("active");
    renderScheduleText();
  };
});

const selectTime = (event) => {
  const { year, month, date, time } = event.target.dataset;
  const scheduleIndex = getScheduleIndexByDate(year, month, date);
  if (event.target.classList.contains("active")) {
    event.target.classList.remove("active");
    for (let i in schedules[scheduleIndex].times) {
      if (schedules[scheduleIndex].times[i] === parseInt(time)) {
        schedules[scheduleIndex].times.splice(i, 1);
        break;
      }
    }
  } else {
    event.target.classList.add("active");
    schedules[scheduleIndex].times.push(parseInt(time));
  }
  schedules[scheduleIndex].times.sort((a, b) => {
    if (a > b) {
      return 1;
    } else {
      return -1;
    }
  });
  renderScheduleText();
};

document.getElementById("copy").onclick = async () => {
  const schedule = document.getElementById("scheduleText").value;
  await navigator.clipboard.writeText(schedule);
  alert(
    "スケジュールをコピーしました。\n調整さんの「日にち候補」に貼り付けてください。"
  );
  window.open("https://chouseisan.com/#tab2", "_blank");
};
