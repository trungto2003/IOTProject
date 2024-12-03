import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { WiHumidity } from 'weather-icons-react';

const useStyles = makeStyles(theme => ({
  root: {
    width: 300,
    height: 180,
    margin: '0 32px',
    padding: theme.spacing(2),
    backgroundColor: props => getBackgroundColor(props.humidity),
    position: 'relative',
    transition: 'background-color 0.3s ease', 
    border: '2px solid #3f51b5', 
    borderRadius: theme.shape.borderRadius, 
  },
  iconContainer: {
    position: 'absolute',
    top: theme.spacing(1),
    left: theme.spacing(1),
    backgroundColor: 'transparent',
    padding: theme.spacing(1),
    borderRadius: '50%',
  },
  cardHeader: {
    paddingLeft: '50px',
    '& div span': {
      fontSize: '18px',
      fontWeight: 'bold', 
    },
  },
  badgeText: {
    paddingLeft: '5px',
    fontSize: '20px', 
    fontWeight: 'bold',
  },
}));

function getBackgroundColor(humidity) {
  const maxHumidity = 100; 
  const intensity = Math.min(255, Math.floor((humidity / maxHumidity) * 255));
  return `rgba(0, 0, 255, ${intensity / 255})`; 
}

export default function HumidityCard() {
  const [humidity, setHumidity] = useState(0); 
  const classes = useStyles({ humidity });

  useEffect(() => {
    const fetchHumidityData = async () => {
      try {
        const response = await fetch('http://localhost:3000/sensor/realtime');
        const data = await response.text();
        const [, , hum] = data.split('|'); // Lấy độ ẩm từ dữ liệu
        setHumidity(parseFloat(hum)); // Cập nhật độ ẩm
      } catch (error) {
        console.error('Error fetching humidity data:', error);
      }
    };

    fetchHumidityData(); // Gọi lần đầu tiên

    const intervalId = setInterval(() => {
      fetchHumidityData(); // Gọi lại API sau mỗi 5 giây
    }, 1000); // 5000 ms = 5 giây

    // Dọn dẹp khi component bị unmount
    return () => clearInterval(intervalId);
  }, []); // Chạy 1 lần khi component được mount

  return (
    <Card className={classes.root}>
      <div className={classes.iconContainer}>
        <WiHumidity size={40} color="#FFFFFF" />
      </div>
      <CardHeader
        className={classes.cardHeader}
        title="Độ ẩm (%)"
      />
      <CardContent>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="h2" 
          className={classes.badgeText} 
        >
          {`${humidity}%`} 
        </Typography>
      </CardContent>
    </Card>
  );
}
