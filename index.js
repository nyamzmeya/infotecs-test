// импортируем данные из отдельного файла

import columns from "./data.js";

// к body будем добавлять таблицу и другие элементы
let body = document.querySelector("body");
body.style.display = "flex";
body.style.justifyContent = "space-between";

// словарь для русификации названия колонок
let ru = {
  firstName: "Имя",
  lastName: "Фамилия",
  about: "Описание",
  eyeColor: "Цвет глаз",
};

// нам нужны не все изначальные данные, положим модифицированные данные в новый массив
let data = [];
columns.forEach((item) => {
  item.firstName = item.name.firstName;
  item.lastName = item.name.lastName;
  let obj = {
    firstName: item.firstName,
    lastName: item.lastName,
    about: item.about,
    eyeColor: item.eyeColor,
  };

  data.push(obj);
});

let myTableDiv = document.querySelector("div.myTable");

// функция для сортировки колонок где мы обновляем данные и отрисовываем таблицу с новыми
function buttonSort(button) {
  let item = button.dataset.item;
  let option = button.dataset.option;

  if (option == "up") {
    data = data.sort((a, b) => {
      return (a[item] > b[item]) - (a[item] < b[item]);
    });
    button.dataset.option = "down";
    button.textContent = "\u2B07";
  } else {
    data = data.sort((a, b) => {
      return (a[item] < b[item]) - (a[item] > b[item]);
    });
    button.dataset.option = "up";
    button.textContent = "\u2B06";
  }

  renderTable(data);
}

// функция для редактирования данных
function editTable(text, index, column) {
  let edit = document.querySelector("div.edit");
  edit.style.width = "50%";
  edit.style.display = "flex";
  edit.style.flexDirection = "column";
  edit.style.justifyContent = "flex-start";
  edit.style.alignItems = "center";

  if (document.querySelector("textarea")) {
    document.querySelector("textarea").remove();
    document.querySelector("button.editButton").remove();
  }

  let input = document.createElement("textarea");
  input.className = "edit-input";
  input.style.width = "70%";
  input.style.height = "100px";
  input.style.display = "block";
  input.innerText = text;

  let editButton = document.createElement("button");
  editButton.className = "editButton";
  editButton.style.cursor = "pointer";
  editButton.style.width = "80px";
  editButton.style.marginTop = "30px";
  editButton.style.display = "block";
  editButton.innerText = "Edit";

  editButton.addEventListener("click", () => {
    let new_text = input.value;
    data[index][column] = new_text;
    document.querySelector("textarea").remove();
    document.querySelector("button.editButton").remove();
    renderTable(data);
  });
  edit.appendChild(input);
  edit.appendChild(editButton);
}

// функция для отрисовывания head таблицы

function headRender(table, keys) {
  let thead = document.createElement("thead");

  table.appendChild(thead);

  for (let i = 0; i < keys.length; i++) {
    let th = document.createElement("th");
    th.textContent = ru[keys[i]];
    th.dataset.column = keys[i];
    th.style.border = "1px solid black";
    th.style.borderCollapse = "collapse";
    let button = document.createElement("button");
    button.style.display = "block";
    button.style.marginLeft = "auto";
    button.style.marginRight = "auto";
    button.style.width = "30px";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";
    button.className = "button";
    button.textContent = "\u2B06";
    button.dataset.item = keys[i];
    button.dataset.option = "up";
    th.appendChild(button);
    thead.appendChild(th);
    button.addEventListener("click", () => buttonSort(button));
  }
}

// задаем активный номер страницы для пагинации который будем изменять при нажатии
// на номер и при изменении отрисовывать таблицу заново
let active = 0;
function renderPagination(n_pages) {
  let pages = document.createElement("div");
  pages.className = "pagination";
  pages.style.display = "flex";
  pages.style.width = "30%";
  pages.style.justifyContent = "space-between";
  pages.style.margin = "30px auto auto auto";

  for (let i = 0; i < n_pages; i++) {
    let page = document.createElement("button");
    page.innerText = i + 1;
    page.style.cursor = "pointer";
    if (i == active) {
      page.style.boxShadow = "-1px 0px 14px 14px rgba(0, 144, 255, 0.21)";
    }
    page.addEventListener("click", (e) => {
      active = parseInt(e.target.innerText - 1);

      renderTable(data);
    });
    pages.appendChild(page);
  }

  return pages;
}

// функция для отрисовки чекбоксов для фильтрования показа колонок
function renderCheckBox(keys) {
  let form = document.createElement("div");
  form.className = "checkbox";
  form.style.margin = "10px auto 10px auto";
  form.style.width = "fit-content";

  for (let i = 0; i < keys.length; i++) {
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "column";
    checkbox.value = keys[i];
    checkbox.id = keys[i];
    // изначально показываем все колонки
    checkbox.checked = true;

    checkbox.addEventListener("change", (e) => {
      // убираем/ показываем колонки по дата атрибуту
      let columns = document.querySelectorAll(`[data-column=${keys[i]}]`);

      if (e.currentTarget.checked) {
        [...columns].forEach((c) => (c.style.display = ""));
      } else {
        [...columns].forEach((c) => (c.style.display = "none"));
      }
    });

    let label = document.createElement("label");
    label.htmlFor = keys[i];
    label.appendChild(document.createTextNode(ru[keys[i]]));

    form.appendChild(checkbox);
    form.appendChild(label);
  }

  return form;
}

// отрисовка таблицы
function renderTable(data) {
  let table;
  let keys = Object.keys(data[0]);

  // при первой отрисовке рисуем и head и body, дальше перерисовываем
  // только body чтобы отслеживать кнопки сортировки в head
  if (document.querySelector("tbody")) {
    document.querySelector("tbody").remove();
    table = document.querySelector("table");
  } else {
    table = document.createElement("table");
    headRender(table, keys);
  }

  let tbody = document.createElement("tbody");
  myTableDiv.style.maxWidth = "50%";

  table.style.border = "1px solid black";
  table.style.borderCollapse = "collapse";

  // если текст это цвет учитываем это при отрисовке
  let colors = ["blue", "red", "brown", "green"];

  // по активному номеру из пагинации отрисовыем только нужный сет данных
  for (let k = active * 10 + 1; k < active * 10 + 10; k++) {
    let vals = Object.values(data[k]);
    let row = document.createElement("tr");
    for (let b = 0; b < vals.length; b++) {
      var cell = document.createElement("td");
      cell.style.border = "1px solid black";
      cell.style.borderCollapse = "collapse";
      cell.textContent = vals[b];
      cell.style.cursor = "pointer";
      cell.dataset.column = keys[b];
      let column = Object.keys(ru)[b];
      cell.addEventListener("click", () => editTable(vals[b], k, column));
      // если текст слишком большой обрезаем его точками
      if (vals[b].length >= 100) {
        cell.style.overflow = "hidden";
        cell.style.textOverflow = "ellipsis";
        cell.style.display = "-webkit-box";
        cell.style.webkitBoxOrient = "vertical";
        cell.style.webkitLineClamp = 2;
      }
      // текст с цветом
      if (colors.includes(vals[b])) {
        cell.style.color = vals[b];
      }
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  }

  // при изменении активного номера отрисовываем таблицу и пагинацию заново
  if (document.querySelector("div.pagination")) {
    document.querySelector("div.pagination").remove();
  }

  let pages = renderPagination(data.length / 10);

  table.appendChild(tbody);

  // отрисовываем чекбоксы
  if (!document.querySelector("div.checkbox")) {
    let checkBox = renderCheckBox(keys);

    myTableDiv.appendChild(checkBox);
  }

  myTableDiv.appendChild(table);
  myTableDiv.appendChild(pages);
}

// инициализация таблицы
renderTable(data);
