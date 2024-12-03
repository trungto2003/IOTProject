import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { WiWindy } from 'weather-icons-react'; // Giữ icon gió, bạn có thể thay đổi nếu cần

const useStyles = makeStyles(theme => ({
  root: {
    width: 300,
    height: 180,
    margin: '0 2px',
    padding: theme.spacing(2),
    backgroundColor: props => getBackgroundColor(props.air),
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
  airText: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
}));

function getBackgroundColor(air) {
  const maxAir = 100; // Giới hạn mức độ không khí tối đa (có thể điều chỉnh)
  const intensity = Math.min(255, Math.floor((air / maxAir) * 255));
  return `rgba(255, 255, 0, ${intensity / 255})`; // Màu vàng thể hiện mức độ không khí
}

export default function AirCard() {
  const [air, setAir] = useState(0);
  const classes = useStyles({ air });

  useEffect(() => {
    const fetchAirData = async () => {
      try {
        const response = await fetch('http://localhost:3000/sensor/realtime');
        const data = await response.text();
        const [, , , , , , air] = data.split('|'); // Tách dữ liệu và lấy giá trị không khí
        setAir(parseFloat(air)); // Cập nhật giá trị không khí
      } catch (error) {
        console.error('Error fetching air data:', error);
      }
    };

    fetchAirData(); // Gọi API lần đầu tiên

    const intervalId = setInterval(() => {
      fetchAirData(); // Cập nhật giá trị không khí mỗi 2 giây
    }, 2000);

    // Dọn dẹp khi component bị unmount
    return () => clearInterval(intervalId);
  }, []); // Chạy 1 lần khi component được mount

  return (
    <Card className={classes.root}>
      <div className={classes.iconContainer}>
        <WiWindy size={40} color="#3f51b5" /> {/* Bạn có thể thay đổi icon nếu cần */}
      </div>
      <CardHeader
        className={classes.cardHeader}
        title="Không khí" // Tiêu đề hiển thị không khí
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2" className={classes.airText}>
          {`${air} %`} {/* Hiển thị giá trị không khí */}
        </Typography>
      </CardContent>
    </Card>
  );
}
