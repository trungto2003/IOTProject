import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import { MdOutlineLightbulb } from 'react-icons/md';

const useStyles = makeStyles(theme => ({
  root: {
    width: 300,
    height: 180,
    margin: '0 2px',
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
    position: 'relative',
    border: '2px solid #3f51b5',
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  iconContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    boxShadow: '0 0 25px gray', // Tăng độ mạnh của bóng đổ
    transition: 'box-shadow 0.1s ease', // Hiệu ứng mượt khi đổi màu nền
  },
  warningLight: {
    fontSize: '60px', // Kích thước icon
    color: 'gray', // Màu xám ban đầu
    transition: 'color 0.1s ease', // Hiệu ứng chuyển màu mượt mà
  },
  warningLightActive: {
    animation: '$blinking 0.5s infinite', // Giảm thời gian để nhấp nháy nhanh hơn
  },
  iconContainerActive: {
    animation: '$shadowBlinking 0.5s infinite', // Giảm thời gian để nhấp nháy nhanh hơn
  },
  // Định nghĩa animation đổi màu của icon giữa xám và đỏ
  '@keyframes blinking': {
    '0%': { color: 'gray' },
    '50%': { color: '#ff0000' },  // Màu đỏ tươi
    '100%': { color: 'gray' },
  },
  // Định nghĩa animation đổi màu nền theo màu viền
  '@keyframes shadowBlinking': {
    '0%': { boxShadow: '0 0 25px gray' }, // Tăng độ mạnh của bóng đổ
    '50%': { boxShadow: '0 0 25px #ff0000' }, // Màu đỏ tươi
    '100%': { boxShadow: '0 0 25px gray' },
  },
}));

export default function WindspeedCard() {
  const [windspeed, setWindspeed] = useState(0);
  const classes = useStyles();

  useEffect(() => {
    const fetchWindspeedData = async () => {
      try {
        const response = await fetch('http://localhost:3000/sensor/realtime');
        const data = await response.text();
        const [, , , , wind] = data.split('|');
        setWindspeed(parseFloat(wind));
      } catch (error) {
        console.error('Error fetching windspeed data:', error);
      }
    };

    fetchWindspeedData();

    const intervalId = setInterval(() => {
      fetchWindspeedData();
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card className={classes.root}>
      <div
        className={`${classes.iconContainer} ${windspeed >= 60 ? classes.iconContainerActive : ''}`}
      >
        <MdOutlineLightbulb
          className={`${classes.warningLight} ${windspeed >= 60 ? classes.warningLightActive : ''}`}
        />
      </div>
    </Card>
  );
}
