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
    backgroundColor: props => getBackgroundColor(props.sound),
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
  soundText: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
}));

function getBackgroundColor(sound) {
  const maxSound = 100; // Giới hạn âm thanh tối đa (có thể điều chỉnh theo yêu cầu)
  const intensity = Math.min(255, Math.floor((sound / maxSound) * 255));
  return `rgba(255, 0, 0, ${intensity / 255})`; // Màu đỏ thể hiện cường độ âm thanh
}

export default function SoundCard() {
  const [sound, setSound] = useState(0);
  const classes = useStyles({ sound });

  useEffect(() => {
    const fetchSoundData = async () => {
      try {
        const response = await fetch('http://localhost:3000/sensor/realtime');
        const data = await response.text();
        const [, , , , , sound] = data.split('|'); // Tách dữ liệu và lấy giá trị âm thanh
        setSound(parseFloat(sound)); // Cập nhật giá trị âm thanh
      } catch (error) {
        console.error('Error fetching sound data:', error);
      }
    };

    fetchSoundData(); // Gọi API lần đầu tiên

    const intervalId = setInterval(() => {
      fetchSoundData(); // Cập nhật giá trị âm thanh mỗi 2 giây
    }, 2000);

    // Dọn dẹp khi component bị unmount
    return () => clearInterval(intervalId);
  }, []); // Chạy 1 lần khi component được mount

  return (
    <Card className={classes.root}>
      <div className={classes.iconContainer}>
        <WiWindy size={40} color="#3f51b5" /> {/* Sử dụng biểu tượng gió, có thể thay đổi icon nếu cần */}
      </div>
      <CardHeader
        className={classes.cardHeader}
        title="Âm thanh (dB)" // Tiêu đề hiển thị âm thanh
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2" className={classes.soundText}>
          {`${sound} dB`} {/* Hiển thị giá trị âm thanh */}
        </Typography>
      </CardContent>
    </Card>
  );
}
