import React, { useEffect, useState } from 'react';
import { Grid, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import WindSpeed from '../homepageitems/cart/WindSpeed';
import Sound from '../homepageitems/cart/Sound';
import Air from '../homepageitems/cart/Air';
import WindChart from '../homepageitems/chart/WindChart';
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
        const [,,,,WindSpeed, Sound, Air] = data.split('|');

        setSensorData({
          WindSpeed: parseFloat(WindSpeed),
          Sound: parseFloat(Sound),
          Air: parseFloat(Air),
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
            <WindSpeed WindSpeed={sensorData.WindSpeed} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box className={classes.card}>
            <Sound Sound={sensorData.Sound} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={4} className={classes.fullHeightGridItem}>
          <Box className={classes.card}>
            <Air Air={sensorData.Air} />
           
          </Box>
        </Grid>
        <Grid item xs={12} sm={11}>
          <Box className={classes.chartContainer}>
            <WindChart />
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