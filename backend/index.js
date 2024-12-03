// Import các thư viện cần thiết
const express = require("express"); // Express framework để tạo server
const app = express(); // Khởi tạo ứng dụng Express
const cors = require("cors"); // Thư viện CORS để xử lý việc chia sẻ tài nguyên giữa các nguồn khác nhau
const mysql2 = require("mysql2"); // Thư viện MySQL để kết nối và thực hiện các truy vấn MySQL
const mqtt = require("mqtt"); // Thư viện MQTT để giao tiếp với broker MQTT
const WebSocket = require("ws"); // Thư viện WebSocket để giao tiếp thời gian thực với client

// Thiết lập kết nối với cơ sở dữ liệu MySQL
const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "170797", // Mật khẩu cho user root
  database: "dbtest", // Tên cơ sở dữ liệu
  dateStrings: ["DATETIME"], // Đảm bảo các trường DATETIME trả về dạng chuỗi
});

// Kết nối với broker MQTT tại địa chỉ localhost
const mqttClient = mqtt.connect({
  host: '192.168.1.3',
  port: 1993,
  username: 'user', // Thêm username
  password: 'trung', // Thêm password
});

// Tạo HTTP server từ Express app để có thể kết hợp với WebSocket
const server = require("http").createServer(app);

// Tạo một WebSocket server kết nối với HTTP server
const wss = new WebSocket.Server({ server: server });

// Body-parser middleware để xử lý các yêu cầu HTTP với body chứa URL-encoded và JSON
const bodyParser = require("body-parser");
const e = require("express");

// Kết nối với MySQL database và kiểm tra kết nối
db.connect(
  (error) =>
    error
      ? console.error("Connect error:", error) // Hiển thị lỗi nếu không kết nối được
      : console.log("Connected MySQL") // Thông báo kết nối thành công
);

// Thiết lập các middleware cho ứng dụng
app.use(bodyParser.urlencoded({ extended: false })); // Xử lý các dữ liệu URL-encoded
app.use(bodyParser.json()); // Xử lý dữ liệu JSON
app.use(cors()); // Cho phép CORS (Cross-Origin Resource Sharing)

// Khi có một kết nối WebSocket mới từ client
wss.on("connection", (ws) => {
  console.log("Client Connected"); // Thông báo có client kết nối

  // Lắng nghe thông điệp từ client
  ws.on("message", (message) => {
    console.log("Received message:", message); // Kiểm tra xem có nhận được thông điệp không

    const json = message.toString().split("|");

    // Thực hiện truy vấn chèn dữ liệu vào bảng `action`
    db.query(
      `INSERT INTO action (device_id, status, time) VALUES('${json[0]}', '${json[1]}', '${timeNow()}')`,
      (err, result) => {
        if (err) {
          console.error("Error inserting data into DB:", err);
        } else {
          console.log("Data successfully inserted into DB:", result);
        }
      }
    );

    // Gửi thông điệp đến broker MQTT với topic 'button'
    mqttClient.publish("button", json[0] + "|" + json[1]);
  });

  // Khi client đóng kết nối
  ws.on("close", () => console.log("Client Disconnected"));
});

  

// Lắng nghe thông điệp từ broker MQTT
let deviceStatus = null; // Biến lưu trữ trạng thái thiết bị

  mqttClient.on("message", (topic, message) => {
    const json = message.toString().split("|");

    // Xử lý topic "sensor" và chèn dữ liệu vào bảng `sensor`
    if (topic === "sensor") {
      db.query(
        `INSERT INTO sensor (device_id, temperature, humidity, light, windspeed, sound, air, time) VALUES 
        ('${json[0]}', ${json[1]}, ${json[2]}, ${json[3]}, ${json[4]}, ${json[5]}, ${json[6]}, '${timeNow()}')`,
        (err) => { if (err) console.error("Error inserting sensor data:", err); }
      );
      console.log("Sensor data:", json);
    }

    // Xử lý topic "action" để cập nhật trạng thái thiết bị
    if (topic === "action") {
      deviceStatus = { device: json[0], status: json[1] }; // Lưu trạng thái thiết bị vào biến deviceStatus
      console.log("Updated device status:", deviceStatus);
    }
  

  // API để client lấy trạng thái thiết bị hiện tại
  app.get("/device", (req, res) => {
    if (deviceStatus) {
      res.json(deviceStatus);
    } else {
      res.status(404).json({ message: "No device status available" });
    }
  });
    
   // Hiển thị thông điệp trên console

    // Uncomment the following code to enable the light sensor functionality
    // if (json[3] < 100) {
    //   db.query(
    //     `INSERT INTO action (device_id, status, time) VALUES('led', 'on', '${timeNow()}')`,
    //     (err, result) => {
    //       if (err) {
    //         console.error("Error inserting data into DB:", err);
    //       } else {
    //         console.log("Data successfully inserted into DB:", result);
    //       }
    //     }
    //   );
    //   // Gửi thông điệp đến broker MQTT với topic 'button'
    //   mqttClient.publish("button", "led|on");
    //   // Alert(1)
    //   app.get("/alert", (req, res) => {
    //     res.send("1");
    //   });

    //   // Thay đổi nút bấm trên frontend
    //   app.get("/button", (req, res) => {
    //     res.send("led|on");
    //   });
    // }
    // else {
    //   db.query(
    //     `INSERT INTO action (device_id, status, time) VALUES('led', 'off', '${timeNow()}')`,
    //     (err, result) => {
    //       if (err) {
    //         console.error("Error inserting data into DB:", err);
    //       } else {
    //         console.log("Data successfully inserted into DB:", result);
    //       }
    //     }
    //   );
    //   // Gửi thông điệp đến broker MQTT với topic 'button'
    //   mqttClient.publish("button", "led|off");
    //   // Alert(1)
    //   app.get("/alert", (req, res) => {
    //     res.send("0");
    //   });
    //   // Thay đổi nút bấm trên frontend
    //   app.get("/button", (req, res) => {
    //     res.send("led|off");
    //   });
    // }

    
  
  // Lắng nghe MQTT và cập nhật trạng thái thiết bị khi nhận thông báo từ topic "status"
  
  

  // API để lấy dữ liệu cảm biến mới nhất từ bảng sensor
  app.get("/sensor/realtime", (req, res) => {
    // Truy vấn lấy bản ghi mới nhất từ bảng `sensor`
    db.query(
      "SELECT * FROM sensor ORDER BY id DESC LIMIT 1",
      (err, data) => {
        if (err) {
          console.error("Error retrieving latest sensor data:", err);
          return res.status(500).json({ error: "Error retrieving sensor data" });
        }
        // Convert data từ JSON sang DHT11|temperature|humidity|light|windspeed
        const message = `${data[0].device_id}|${data[0].temperature}|${data[0].humidity}|${data[0].light}|${data[0].windspeed}|${data[0].sound}|${data[0].air}`;
        // Trả dữ liệu dạng chuỗi về client
        res.send(message);
      }
    );
  });

  // Gửi thông điệp đến tất cả các client WebSocket đang kết nối
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message.toString());
    }
  });

});



// ====================================================================================================
// Sensor API endpoints

// Endpoint để lấy dữ liệu từ bảng `sensor` để hiển thị trên biểu đồ thời gian thực
// app.get("/sensor/realtime", (req, res) => {

// });

// Endpoint để lấy dữ liệu từ bảng `sensor`, hỗ trợ phân trang và sắp xếp
app.get("/sensor", (req, res) => {
  const sortField = req.query.sortField || 'id';
  const sortOrder = req.query.sortOrder || 'asc';
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = (page - 1) * limit;

  const countQuery = "SELECT COUNT(*) AS total FROM sensor";
  const dataQuery = `SELECT * FROM sensor ORDER BY ${sortField} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`;

  db.query(countQuery, (err, countResult) => {
    if (err) {
      console.error("Error counting data:", err);
      return res.status(500).json({ error: "Error counting data from sensor table" });
    }
    else {
      console.log("Data counted from sensor table");
    }

    const totalRecords = countResult[0].total;
    db.query(dataQuery, (err, data) => {
      if (err) {
        console.error("Error retrieving data:", err);
        return res.status(500).json({ error: "Error retrieving data from sensor table" });
      }
      else {
        console.log("Data retrieved from sensor table");
      }

      res.json({
        totalRecords,
        data,
      });
    });
  });
});

// Endpoint để tìm kiếm trong bảng `sensor` dựa trên `type` và `input` từ URL, hỗ trợ sắp xếp
// 
app.get("/sensor/type=:type&input=:input", (req, res) => {
  const columnMapping = {
    id: "id",
    device_id: "device_id",
    temperature: "temperature",
    humidity: "humidity",
    light: "light",
    windspeed: "windspeed",
    sound: "sound",
    air: "air",
    time: "time"
  };

  const column = columnMapping[req.params.type.toLowerCase()];

  if (!column) {
    return res.status(400).json({ error: "Invalid search type" });
  }

  const sortField = req.query.sortField || 'id';
  const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const validColumns = ['id', 'device_id', 'temperature', 'humidity', 'light', 'windspeed', 'sound', 'air', 'time'];

  if (!validColumns.includes(sortField)) {
    return res.status(400).json({ error: "Invalid sort field" });
  }

  // Lấy các tham số phân trang từ query params
  const page = parseInt(req.query.page, 10) || 1;  // Mặc định page 1
  const limit = parseInt(req.query.limit, 10) || 20;  // Mặc định limit 20
  const offset = (page - 1) * limit;  // Tính toán offset

  let query = `SELECT * FROM sensor WHERE `;
  const queryParams = [];

  // Điều kiện tìm kiếm
  const searchTerm = `%${req.params.input.toLowerCase()}%`;
  query += `LOWER(${column}) LIKE ? `;
  queryParams.push(searchTerm);

  // Thêm phần phân trang vào câu truy vấn
  query += `ORDER BY ${sortField} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`;

  db.query(query, queryParams, (err, data) => {
    if (err) {
      console.error("Error retrieving data:", err);
      return res.status(500).json({ error: "Error retrieving data from sensor table" });
    }

    // Tính tổng số bản ghi (dùng cho phân trang)
    const countQuery = `SELECT COUNT(*) AS total FROM sensor WHERE LOWER(${column}) LIKE ?`;
    db.query(countQuery, [searchTerm], (err, countResult) => {
      if (err) {
        console.error("Error counting data:", err);
        return res.status(500).json({ error: "Error counting data" });
      }
      const totalRecords = countResult[0].total;

      // Trả về dữ liệu cùng với tổng số bản ghi
      res.json({
        totalRecords,
        data,
        page,
        limit
      });
    });
  });
});




// Sensor API endpoints
// ====================================================================================================



// ====================================================================================================
// Action API endpoints

// Endpoint bật/tắt thiết bị
app.post("/action", (req, res) => {
  const { device_id, action } = req.body; // Lấy device_id và action từ body của yêu cầu POST

  // Thực hiện truy vấn chèn dữ liệu vào bảng `action`
  db.query(
    `INSERT INTO action (device_id, status, time) VALUES('${device_id}', '${action}', '${timeNow()}')`,
    (err, result) => {
      if (err) {
        console.error("Error inserting data into DB:", err);
        return res.status(500).json({ error: "Error inserting data into action table" });
      } else {
        console.log("Data successfully inserted into action table:", result);

        // Gửi lệnh đến MQTT
        const mqttMessage = `${device_id}|${action}`;
        mqttClient.publish("button", mqttMessage, (mqttErr) => {
          if (mqttErr) {
            console.error("Error publishing to MQTT:", mqttErr);
            return res.status(500).json({ error: "Error publishing to MQTT" });
          } else {
            console.log("Message successfully sent to MQTT:", mqttMessage);
            res.json({ message: "Data successfully inserted into action table and sent to MQTT" });
          }
        });
      }
    }
  );
});


// Endpoint để lấy dữ liệu từ bảng `action`, hỗ trợ sắp xếp và giới hạn 100 bản ghi
app.get("/action", (req, res) => {
  const sortField = req.query.sortField || 'id'; // Cột sắp xếp, mặc định là 'id'
  const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC'; // Thứ tự sắp xếp, mặc định là giảm dần (DESC)
  const page = parseInt(req.query.page, 10) || 1; // Trang hiện tại, mặc định là 1
  const limit = parseInt(req.query.limit, 10) || 20; // Số bản ghi trên mỗi trang, mặc định là 20 
  const offset = (page - 1) * limit; // Vị trí bắt đầu lấy dữ liệu

  const countQuery = "SELECT COUNT(*) AS total FROM action";
  const dataQuery = `SELECT * FROM action ORDER BY ${sortField} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`;

  db.query(countQuery, (err, countResult) => {
    if (err) {
      console.error("Error counting data:", err);
      return res.status(500).json({ error: "Error counting data from action table" });
    }
    else {
      console.log("Data counted from action table");
    }

    const totalRecords = countResult[0].total;
    db.query(dataQuery, (err, data) => {
      if (err) {
        console.error("Error retrieving data:", err);
        return res.status(500).json({ error: "Error retrieving data from action table" });
      }
      else {
        console.log("Data retrieved from action table");
      }

      res.json({
        totalRecords,
        data,
      });
    });
  });
});


// Endpoint để tìm kiếm trong bảng `action` dựa trên `input` từ URL, hỗ trợ sắp xếp
app.get("/action/type=:type&input=:input", (req, res) => {
  const columnMapping = {
    id: "id",
    device_id: "device_id",
    status: "status",
    time: "time"
  };

  const column = columnMapping[req.params.type.toLowerCase()];
  if (!column) {
    return res.status(400).json({ error: "Invalid search type" });
  }

  const sortField = req.query.sortField || "id";
  const sortOrder = req.query.sortOrder === "asc" ? "ASC" : "DESC";
  const validColumns = ["id", "device_id", "status", "time"];

  if (!validColumns.includes(sortField)) {
    return res.status(400).json({ error: "Invalid sort field" });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const searchTerm = `%${req.params.input.toLowerCase()}%`;
  const queryParams = [searchTerm];

  // Truy vấn lấy dữ liệu
  let query = `SELECT * FROM action WHERE LOWER(${column}) LIKE ? `;
  query += `ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
  queryParams.push(limit, offset);

  db.query(query, queryParams, (err, data) => {
    if (err) {
      console.error("Error retrieving data:", err);
      return res.status(500).json({ error: "Error retrieving data from action table" });
    }

    // Truy vấn đếm tổng số bản ghi
    const countQuery = `SELECT COUNT(*) AS total FROM action WHERE LOWER(${column}) LIKE ?`;
    db.query(countQuery, [searchTerm], (countErr, countResult) => {
      if (countErr) {
        console.error("Error counting data:", countErr);
        return res.status(500).json({ error: "Error counting data from action table" });
      }

      const totalRecords = countResult[0]?.total || 0;

      res.json({
        totalRecords,
        data,
        page,
        limit
      });
    });
  });
});




// Endpoint để đếm số lần bật thiết bị 'fan' trong bảng `action`
app.get("/action1", (req, res) => {
  db.query(
    "SELECT count(*) as count FROM action where device_id='fan' and status like 'on'",
    (err, data) => {
      const count = data[0].count;
      res.send(count.toString()); // Trả về số lượng dưới dạng chuỗi
    }
  );
});

// Endpoint để đếm số lần bật thiết bị 'led' trong bảng `action`
app.get("/action2", (req, res) => {
  db.query(
    "SELECT count(*) as count FROM action where device_id='led' and status like 'on'",
    (err, data) => {
      const count = data[0].count;
      res.send(count.toString()); // Trả về số lượng dưới dạng chuỗi
    }
  );
});

// Endpoint để đếm số lần bật thiết bị 'ac' trong bảng `action`
app.get("/action3", (req, res) => {
  db.query(
    "SELECT count(*) as count FROM action where device_id='ac' and status like 'on'",
    (err, data) => {
      const count = data[0].count;
      res.send(count.toString()); // Trả về số lượng dưới dạng chuỗi
    }
  );
});

// Action API endpoints
// ====================================================================================================



// Khi kết nối thành công với broker MQTT, đăng ký các topic "sensor" và "action"
mqttClient.on("connect", () => {
  mqttClient.subscribe("sensor");
  mqttClient.subscribe("action");
});

// HTTP server lắng nghe trên cổng 3000
server.listen(3000, () => { });

// Hàm trả về thời gian hiện tại ở định dạng "yyyy-dd-mm HH:MM:SS"
function timeNow() {
  const dateTime = new Date();
  time = dateTime.toTimeString().split(" ")[0];
  [month, day, year] = dateTime.toLocaleDateString().split("/");
  return year + "-" + month + "-" + day + " " + time;
}
