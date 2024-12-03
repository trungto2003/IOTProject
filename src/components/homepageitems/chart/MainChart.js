import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import axios from 'axios';
import { format } from 'date-fns';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    height: 500,
    display: 'flex',
    marginTop: theme.spacing(-70),
  },
}));

const MainChart = () => {
  const classes = useStyles();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      axios.get("http://localhost:3000/sensor", {
        params: {
          sortField: "time",
          sortOrder: "desc",
          page: 1,
          limit: 10
        }
      })
      .then(response => {
        const { data } = response.data;

        const formattedData = data.reverse().map(item => ({
          time: format(new Date(item.time), 'dd/MM/yyyy HH:mm:ss'),
          temperature: item.temperature,
          humidity: item.humidity,
          light: item.light
        }));

        setChartData(formattedData);
      })
      .catch(error => {
        console.error("Error fetching data from API:", error);
      });
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={classes.root}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 30, right: 50, left: 30, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            interval="5"
            label={{
              value: "Thời gian",
              position: "insideBottomRight",
              offset: 0,
              style: { fontWeight: 'bold' }
            }}
            tick={{ fontSize: 12, fontWeight: 'bold' }}
          />
          {/* Trục Y bên trái cho nhiệt độ và độ ẩm */}
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            label={{
              value: "Giá trị cảm biến DHT11",
              angle: -90,
              position: "insideLeft",
              style: { fontWeight: 'bold' },
              dx: 0, // Điều chỉnh vị trí ngang (âm để di chuyển sang trái, dương để sang phải)
              dy: 50,   // Điều chỉnh vị trí dọc (âm để di chuyển lên trên, dương để xuống dưới)
            }}
            tick={{ fontSize: 12, fontWeight: 'bold' }}
          />
          {/* Trục Y bên phải cho ánh sáng */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 1000]}
            label={{
              value: "Ánh sáng (Lux)",
              angle: -90,
              position: "insideRight",
              style: { fontWeight: 'bold' },
              dx: 0, // Điều chỉnh vị trí ngang (âm để di chuyển sang trái, dương để sang phải)
              dy: -40,   // Điều chỉnh vị trí dọc (âm để di chuyển lên trên, dương để xuống dưới)
            }}
            tick={{ fontSize: 12, fontWeight: 'bold' }}
          />
          <Tooltip />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontWeight: 'bold' }}
          />
          <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="red" name="Nhiệt độ (°C)" dot={false} />
          <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="blue" name="Độ ẩm (%)" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="light" stroke="#FFD700" name="Ánh sáng (Lux)" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MainChart;
