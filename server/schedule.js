"use latest";

import bodyParser from "body-parser";
import express from "express";

const server = express();
server.use(bodyParser.json());

function parseDate(date, storage) {
  return {
    hours: getAvailableHours(date, storage),
    monthday: date.getDate(),
    weekday: date.getDay(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

function getAvailableHours(date, storage) {
  const monthday = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const orders = storage
    .filter(
      (order) =>
        order.date.monthday === monthday &&
        order.date.month === month &&
        order.date.year === year
    )
    .map((order) => order.date.hour);

  const hours = [10, 11, 14, 16, 18].filter(
    (hour) => orders.indexOf(hour) === -1
  );

  return hours;
}

function getTomorrow(days) {
  const today = new Date();
  let tomorrow = new Date();
  tomorrow.setDate(today.getDate() + days);
  return tomorrow;
}

function isWeekday(date) {
  return [1, 2, 3, 4, 5].indexOf(date.getDay()) > -1;
}

function getNext15Days(dates, index, storage) {
  dates = dates || [];
  index = index || 0;
  if (index < 15) {
    const days = index + 1;
    const tomorrow = getTomorrow(days);
    const valid = isWeekday(tomorrow) && getAvailableHours(tomorrow, storage);
    const nextDates = valid ? dates.concat(tomorrow) : dates;
    return getNext15Days(nextDates, days, storage);
  } else {
    return dates;
  }
}

function validateOrder(order) {
  let price;
  let delivery;
  let detail;
  let weekday;

  const {
    option,
    urgency,
    withBackup,
    problem,
    backupOption,
    name,
    phone,
    obs,
    place,
    address,
    year,
    month,
    monthday,
    hour,
  } = order;

  weekday = new Date(year, month - 1, monthday, hour).getDay();

  const valid =
    typeof option === "string" &&
    typeof urgency === "boolean" &&
    typeof withBackup === "boolean" &&
    typeof backupOption === "number" &&
    typeof name === "string" &&
    typeof phone === "number" &&
    typeof obs === "string" &&
    typeof place === "string" &&
    typeof address === "string" &&
    typeof year === "number" &&
    typeof month === "number" &&
    typeof monthday === "number" &&
    typeof weekday === "string" &&
    typeof hour === "number" &&
    [
      "format",
      "programProblem",
      "trollProblem",
      "startupProblem",
      "lostFiles",
      "slowProblem",
      "newProgram",
      "backup",
      "virus",
      "help",
      "lawyer",
      "development",
    ].indexOf(option) > -1 &&
    [0, 1, 2].indexOf(problem) > -1 &&
    [0, 1].indexOf(backupOption) > -1 &&
    name.length > 2 &&
    name.length < 36 &&
    obs.length < 128 &&
    place.length > 4 &&
    place.length < 32 &&
    address.length > 8 &&
    address.length < 48;

  if (!valid) {
    return undefined;
  }

  switch (option) {
    case "format":
      if (urgency && withBackup) {
        price = 130.0;
        delivery = 2;
      } else if (urgency) {
        price = 110.0;
        delivery = 2;
      } else if (withBackup) {
        price = 100.0;
        delivery = 7;
      } else {
        price = 80.0;
        delivery = 7;
      }
      break;

    case "programProblem":
      if (urgency) {
        price = 50.0;
        delivery = 0;
      } else {
        price = 30.0;
        delivery = 3;
      }
      break;

    case "trollProblem":
      if (urgency) {
        price = 40.0;
        delivery = 0;
      } else {
        price = 20.0;
        delivery = 2;
      }
      break;

    case "startupProblem":
      const basePrice = urgency ? 120.0 : 80.0;
      delivery = urgency ? 3 : 7;
      if (problem === 2) {
        price = basePrice + 300.0;
        detail = 2;
      } else if (problem === 1) {
        price = basePrice + 20.0;
        detail = 1;
      } else {
        price = basePrice;
        detail = 0;
      }
      break;

    case "lostFiles":
      if (urgency) {
        price = 70.0;
        delivery = 2;
      } else {
        price = 50.0;
        delivery = 5;
      }
      break;

    case "slowProblem":
      if (urgency) {
        price = 50.0;
        delivery = 2;
      } else {
        price = 30.0;
        delivery = 4;
      }
      break;

    case "newProgram":
      if (urgency) {
        price = 40.0;
        delivery = 1;
      } else {
        price = 30.0;
        delivery = 2;
      }
      break;

    case "backup":
      delivery = 8;
      if (backupOption === 1) {
        price = 110.0;
        detail = 1;
      } else {
        price = 90.0;
        detail = 0;
      }
      break;

    case "virus":
      if (urgency) {
        price = 60.0;
        delivery = 0;
      } else {
        price = 40.0;
        delivery = 3;
      }
      break;

    case "help":
      price = 50.0;
      delivery = 0;
      break;

    case "lawyer":
      price = 90.0;
      delivery = 0;
      break;

    case "development":
      price = 0.0;
      delivery = 0;
      break;
  }

  return {
    option,
    urgency,
    withBackup,
    problem,
    backupOption,
    name,
    phone,
    obs,
    place,
    address,
    price,
    delivery,
    date: {
      year,
      month,
      weekday,
      monthday,
      hour,
    },
  };
}

function isHourAvailable(year, month, monthday, hour, storage) {
  return getNext15Days(undefined, undefined, storage)
    .map((date) => parseDate(date, storage))
    .filter(
      (day) =>
        day.year === year &&
        day.month === month &&
        day.monthday === monthday &&
        day.hours.indexOf(hour) > -1
    ).length > 0
    ? true
    : false;
}

function getId(storage) {
  const id = Math.random().toString(36).slice(8).toUpperCase();
  const exists =
    storage.filter((order) => order.id === id).length > 0 ? true : false;

  if (exists || id.length !== 5) {
    return getId(storage);
  } else {
    return id;
  }
}

// Create order
server.post("/", (req, res, next) => {
  storage.get((error, storage) => {
    if (error) {
      res.status(200).send({ status: "error", order: "" });
    }

    const order = validateOrder(req.body);
    const { year, month, monthday, hour } = order.date;

    if (typeof order === "undefined") {
      res.status(200).send({ status: "error", order: "" });
    } else if (!isHourAvailable(year, month, monthday, hour, storage)) {
      res.status(200).send({ status: "unavailable", order: "" });
    } else {
      order.id = getId(storage);
      storage.set(storage.concat(order), (error) => {
        if (error) {
          res.status(200).send({ status: "error", order: "" });
        }

        res.status(201).send({ status: "ok", order: order.id });
      });
    }
  });
});

// Read order
server.get("/:id", (req, res, next) => {
  storage.get((error, storage) => {
    if (error) {
      res.status(200).send({ status: "error", order: "" });
    }

    const { id } = req.params;
    const order = storage.filter((order) => order.id === id);
    if (order.length > 0) {
      res.status(200).send({ status: "ok", order: order[0] });
    } else {
      res.status(200).send({ status: "unavailable", order: "" });
    }
  });
});

// Read scheduling for the next 15 days
server.get("/", (req, res, next) => {
  storage.get((error, storage) => {
    if (error) {
      res.status(200).send({ status: "error", order: "" });
    }

    const schedule = getNext15Days(undefined, undefined, storage).map((date) =>
      parseDate(date, storage)
    );
    res.status(200).send(schedule);
  });
});
