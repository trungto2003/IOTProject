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
    marginTop: theme.spacing(-7),
  },
}));

const WindChart = () => {
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
          windspeed: item.windspeed,  // Thêm windspeed vào dữ liệu
          sound: item.sound,          // Thêm sound vào dữ liệu
          air: item.air               // Thêm air vào dữ liệu
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
  }, []); // Chạy 1 lần khi component được mount

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
          {/* Trục Y bên trái cho windspeed và sound */}
          <YAxis
            yAxisId="left"
            domain={[0, 100]} // Điều chỉnh domain theo giá trị windspeed và sound
            label={{
              value: "Gió và Âm thanh",
              angle: -90,
              position: "insideLeft",
              style: { fontWeight: 'bold' },
              dx: 0, 
              dy: 50,   
            }}
            tick={{ fontSize: 12, fontWeight: 'bold' }}
          />
          {/* Trục Y bên phải cho air */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]} // Điều chỉnh domain cho air
            label={{
              value: "Không khí",
              angle: -90,
              position: "insideRight",
              style: { fontWeight: 'bold' },
              dx: 0, 
              dy: -40,   
            }}
            tick={{ fontSize: 12, fontWeight: 'bold' }}
          />
          <Tooltip />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontWeight: 'bold' }}
          />
          <Line yAxisId="left" type="monotone" dataKey="windspeed" stroke="blue" name="Tốc độ gió (m/s)" dot={false} />
          <Line yAxisId="left" type="monotone" dataKey="sound" stroke="green" name="Âm thanh (dB)" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="air" stroke="#FFD700" name="Không khí (%)" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WindChart;
