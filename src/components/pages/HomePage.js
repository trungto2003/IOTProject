import React, { useEffect, useState } from 'react';
import { Grid, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import NhietDo from '../homepageitems/cart/NhietDo';
import DoAm from '../homepageitems/cart/DoAm';
import AnhSang from '../homepageitems/cart/AnhSang';
import MainChart from '../homepageitems/chart/MainChart';
import ControlPanel from '../homepageitems/button/button';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  card: {
    height: '100%', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  controlPanel: {
    marginTop: theme.spacing(2),
    width: '80%',  
    margin: '0 auto',
  },
  chartContainer: {
    marginTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullHeightGridItem: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
}));

const HomePage = () => {
  const classes = useStyles();
  const [sensorData, setSensorData] = useState({
    temperature: 25, // Giá trị mặc định cho nhiệt độ
    humidity: 60,    // Giá trị mặc định cho độ ẩm
    light: 300,      // Giá trị mặc định cho ánh sáng
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch('http://localhost:3000/sensor/realtime');
        const data = await response.text();
        console.log('Raw Data:', data); // Kiểm tra dữ liệu thô
        const [device_id, temperature, humidity, light] = data.split('|');

        setSensorData({
          temperature: parseFloat(temperature),
          humidity: parseFloat(humidity),
          light: parseFloat(light),
        });
        setLoading(false); // Đánh dấu đã tải xong
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        setLoading(false);
      }
    };

    fetchSensorData();
  }, []);

  if (loading) {
    return <div>Loading data...</div>;
  }

  console.log('Sensor Data:', sensorData); // Kiểm tra dữ liệu cảm biến

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Box className={classes.card}>
            <NhietDo temperature={sensorData.temperature} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box className={classes.card}>
            <DoAm humidity={sensorData.humidity} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={4} className={classes.fullHeightGridItem}>
          <Box className={classes.card}>
            <AnhSang light={sensorData.light} />
            <ControlPanel className={classes.controlPanel} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Box className={classes.chartContainer}>
            <MainChart />
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default HomePage;
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