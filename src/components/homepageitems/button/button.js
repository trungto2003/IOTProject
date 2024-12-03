import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import LightIcon from '@material-ui/icons/WbIncandescent';
import FanIcon from '@material-ui/icons/Toys';
import { TbAirConditioning, TbAirConditioningDisabled } from "react-icons/tb";
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: theme.spacing(5),
    fontFamily: 'Arial, sans-serif',
  },
  controlPanelContainer: {
    border: '3px solid #3f51b5',
    borderRadius: '20px',
    padding: theme.spacing(5),
    backgroundColor: '#e3f2fd',
    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '350px',
    fontFamily: 'Arial, sans-serif',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: theme.spacing(2),
    fontFamily: 'Arial, sans-serif',
  },
  icon: {
    fontSize: '3rem',
    marginRight: theme.spacing(1),
  },
  largeButton: {
    padding: theme.spacing(2),
    fontSize: '5rem',
  },
  customSwitch: {
    marginTop: theme.spacing(1.25),
    '& .MuiSwitch-thumb': {
      width: 28,
      height: 28,
    },
    '& .MuiSwitch-track': {
      height: 16,
    },
  },
  title: {
    marginBottom: theme.spacing(2),
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    fontSize: '24px',
  },
  rotating: {
    animation: '$rotate 2s linear infinite',
  },
  '@keyframes rotate': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));
  
export default function ControlPanel() {
  const classes = useStyles();
  const [isLightOn, setLightOn] = useState(false);
  const [isFanOn, setFanOn] = useState(false);
  const [isAcOn, setAcOn] = useState(false);

  const [isLightIconOn, setLightIconOn] = useState(false);
  const [isFanIconOn, setFanIconOn] = useState(false);
  const [isAcIconOn, setAcIconOn] = useState(false);

  // Call the API to fetch the device status when the component is mounted
   useEffect(() => {
    const interval = setInterval(fetchDeviceStatus, 1000); // Cập nhật mỗi giây
    return () => clearInterval(interval); // Xóa interval khi component unmount
  }, []);

  const fetchDeviceStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3000/device');
      const { device, status } = response.data;

      // Giả sử các thiết bị có tên 'led', 'fan', và 'ac' trong dữ liệu API
      
      // Cập nhật icon theo trạng thái nhận được từ API
      if (device === "led"){
        setLightIconOn(status === "on");
      }
      if(device === "fan"){
        setFanIconOn(status === "on");
      }
      if(device === "ac"){
        setAcIconOn(status === "on");
      }
    } catch (error) {
      console.error("Lỗi khi lấy trạng thái thiết bị:", error);
    }
  };
  

  const handleToggleLight = () => {
    const action = isLightOn ? 'off' : 'on';
    setLightOn(!isLightOn);
    
    setTimeout(() => {
      sendActionToAPI('led', action);
    }, 1000);
  };

  const handleToggleFan = () => {
    const action = isFanOn ? 'off' : 'on';
    setFanOn(!isFanOn);
    
    setTimeout(() => {
      sendActionToAPI('fan', action);
    }, 1000);
  };

  const handleToggleAc = () => {
    const action = isAcOn ? 'off' : 'on';
    setAcOn(!isAcOn);
    
    setTimeout(() => {
      sendActionToAPI('ac', action);
    }, 1000);
  };

  const sendActionToAPI = async (deviceId, action) => {
    try {
      const response = await axios.post('http://localhost:3000/action', {
        device_id: deviceId,
        action: action,
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error sending action to API:", error);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.controlPanelContainer}>
        <Typography variant="h6" className={classes.title}>
          Điều khiển thiết bị
        </Typography>

        <div className={classes.buttonContainer}>
          <IconButton
            color={isLightIconOn ? 'primary' : 'default'}
            onClick={handleToggleLight}
            className={classes.largeButton}
          >
            <LightIcon className={classes.icon} />
          </IconButton>
          <Switch
            checked={isLightOn}
            onChange={handleToggleLight}
            className={classes.customSwitch}
            inputProps={{ 'aria-label': 'light switch' }}
          />
        </div>

        <div className={classes.buttonContainer}>
          <IconButton
            color={isFanIconOn ? 'primary' : 'default'}
            onClick={handleToggleFan}
            className={classes.largeButton}
          >
            <FanIcon className={`${classes.icon} ${isFanIconOn ? classes.rotating : ''}`} />
          </IconButton>
          <Switch
            checked={isFanOn}
            onChange={handleToggleFan}
            className={classes.customSwitch}
            inputProps={{ 'aria-label': 'fan switch' }}
          />
        </div>

        <div className={classes.buttonContainer}>
          <IconButton
            color={isAcIconOn ? 'primary' : 'default'}
            onClick={handleToggleAc}
            className={classes.largeButton}
          >
            {isAcIconOn ? (
              <TbAirConditioning className={classes.icon} />
            ) : (
              <TbAirConditioningDisabled className={classes.icon} />
            )}
          </IconButton>
          <Switch
            checked={isAcOn}
            onChange={handleToggleAc}
            className={classes.customSwitch}
            inputProps={{ 'aria-label': 'ac switch' }}
          />
        </div>
      </div>
    </div>
  );
}
