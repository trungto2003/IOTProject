import React, { useState } from 'react';
import { Container, Typography, TextField, Paper, Grid, Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import anhDaiDien from './anhdaidien.jpg';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(4),
    margin: 'auto',
    maxWidth: 600,
    boxShadow: theme.shadows[5],
    borderRadius: theme.shape.borderRadius,
    textAlign: 'center',
    fontFamily: 'Poppins, sans-serif',
  },
  title: {
    marginBottom: theme.spacing(2),
    fontWeight: 700,
  },
  inputField: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    margin: 'auto',
  },
}));

const Profile = () => {
  const classes = useStyles();
  const [name] = useState('Tô Hữu Trung');
  const [studentId] = useState('B21DCAT194');
  const [github] = useState('https://github.com/trungto2003/IOTDashboardTrung');
  const [apiDocs] = useState('https://documenter.getpostman.com/view/38053917/2sAY4vfMgs');
  const [pdf] = useState('https://drive.google.com/file/d/1kKJ2yAZWzVz5HcAw2bzaSMUg8C97C8HP/view?usp=sharing');
  const [avatarUrl] = useState(anhDaiDien);

  const renderLinkField = (label, link) => (
    <TextField
      fullWidth
      label={label}
      variant="outlined"
      value={link}
      className={classes.inputField}
      InputProps={{
        readOnly: true,
        style: { fontWeight: 600 },
      }}
      onClick={() => window.open(link, '_blank')} // mở link khi click
    />
  );

  return (
    <Container>
      <Paper className={classes.paper}>
        <Typography variant="h4" className={classes.title}>
          Thông tin cá nhân
        </Typography>
        <Avatar alt="Avatar" src={avatarUrl} className={classes.avatar} />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Họ và tên"
              variant="outlined"
              value={name}
              className={classes.inputField}
              InputProps={{ readOnly: true, style: { fontWeight: 600 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mã sinh viên"
              variant="outlined"
              value={studentId}
              className={classes.inputField}
              InputProps={{ readOnly: true, style: { fontWeight: 600 } }}
            />
          </Grid>
          <Grid item xs={12}>
            {renderLinkField("GitHub", github)}
          </Grid>
          <Grid item xs={12}>
            {renderLinkField("Swagger/Postman/APIdocs", apiDocs)}
          </Grid>
          <Grid item xs={12}>
            {renderLinkField("PDF", pdf)}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Profile;
