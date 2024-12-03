import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { MdLightMode } from "react-icons/md";
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles(theme => ({
  root: {
    maxWidth: 300, 
    height: 180,
    margin: '0 45px',
    padding: theme.spacing(2),
    backgroundColor: props => `rgba(255, 255, 0, ${props.lightLevel / 1000})`,
    transition: 'background-color 0.3s ease',
    position: 'relative',
    border: '2px solid #1E88E5', // Viền xanh dương
    borderRadius: '8px', 
  },
  cardHeader: {
    '& div span': {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '-12px',
    },
  },
  lightLevelContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(2),
  },
  progressBar: {
    width: '100%',
    marginLeft: theme.spacing(2),
  },
  badgeText: {
    paddingLeft: '5px',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  sunIcon: {
    fontSize: '28px', 
    marginRight: theme.spacing(1),
    marginTop: '-10px',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
  },
}));


export default function LightIntensitySingleRoom() {
  const [lightLevel, setLightLevel] = useState(0); // Khởi tạo state cho mức ánh sáng

  const classes = useStyles({ lightLevel });

  useEffect(() => {
    const fetchLightData = async () => {
      try {
        const response = await fetch('http://localhost:3000/sensor/realtime');
        const data = await response.text();
        const [, , , light] = data.split('|'); // Lấy ánh sáng từ dữ liệu
        setLightLevel(parseFloat(light)); // Cập nhật mức ánh sáng
      } catch (error) {
        console.error('Error fetching light data:', error);
      }
    };

    fetchLightData(); // Gọi lần đầu tiên

    const intervalId = setInterval(() => {
      fetchLightData(); // Gọi lại API sau mỗi 5 giây
    }, 1000); // 5000 ms = 5 giây

    // Dọn dẹp khi component bị unmount
    return () => clearInterval(intervalId);
  }, []); // Chạy 1 lần khi component được mount

  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.cardHeader}
        title={
          <div className={classes.iconContainer}>
            <MdLightMode className={classes.sunIcon} />
            Ánh sáng (lux)
          </div>
        }
      />
      <CardContent>
        <div className={classes.lightLevelContainer}>
          <Typography className={classes.badgeText}>
            {`${lightLevel} lux`}
          </Typography>
          <LinearProgress
            className={classes.progressBar}
            variant="determinate"
            value={(lightLevel / 1000) * 100}
            color="primary"
          />
        </div>
      </CardContent>
    </Card>
  );
}
