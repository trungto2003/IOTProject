import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { WiWindy } from 'weather-icons-react'; 

const useStyles = makeStyles(theme => ({
  root: {
    width: 300,
    height: 180,
    margin: '0 2px',
    padding: theme.spacing(2),
    backgroundColor: props => getBackgroundColor(props.windspeed),
    position: 'relative',
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
  windspeedText: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
}));

function getBackgroundColor(windspeed) {
  const maxWindSpeed = 30; // Giới hạn tốc độ gió tối đa (có thể điều chỉnh theo yêu cầu)
  const intensity = Math.min(255, Math.floor((windspeed / maxWindSpeed) * 255));
  return `rgba(0, 0, 255, ${intensity / 255})`; // Màu xanh dương thể hiện tốc độ gió
}

export default function WindspeedCard() {
  const [windspeed, setWindspeed] = useState(0);
  const classes = useStyles({ windspeed });

  useEffect(() => {
    const fetchWindspeedData = async () => {
      try {
        const response = await fetch('http://localhost:3000/sensor/realtime');
        const data = await response.text();
        const [, , , , wind] = data.split('|'); // Tách dữ liệu và lấy giá trị windspeed
        setWindspeed(parseFloat(wind)); // Cập nhật giá trị tốc độ gió
      } catch (error) {
        console.error('Error fetching windspeed data:', error);
      }
    };

    fetchWindspeedData(); // Gọi API lần đầu tiên

    const intervalId = setInterval(() => {
      fetchWindspeedData(); // Cập nhật tốc độ gió mỗi 1 giây
    }, 2000);

    // Dọn dẹp khi component bị unmount
    return () => clearInterval(intervalId);
  }, []); // Chạy 1 lần khi component được mount

  return (
    <Card className={classes.root}>
      <div className={classes.iconContainer}>
        <WiWindy size={40} color="#3f51b5" /> {/* Sử dụng biểu tượng gió */}
      </div>
      <CardHeader
        className={classes.cardHeader}
        title="Tốc độ Gió (m/s)" // Tiêu đề hiển thị tốc độ gió
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2" className={classes.windspeedText}>
          {`${windspeed} m/s`} {/* Hiển thị tốc độ gió */}
        </Typography>
      </CardContent>
    </Card>
  );
}
