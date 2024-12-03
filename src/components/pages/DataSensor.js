import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import axios from 'axios';

const useStyles = makeStyles({
  table: { minWidth: 650 },
  centerText: { textAlign: 'center', fontWeight: 'bold' },
  filterContainer: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '8px',
  },
  filterButton: { marginLeft: '16px' },
});

export default function DeviceStatusTable() {
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchType, setSearchType] = useState('id');
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [isSearching, setIsSearching] = useState(false);

  const fetchData = async () => {
    try {
      const url = isSearching
        ? `http://localhost:3000/sensor/type=${searchType}&input=${searchValue}`
        : 'http://localhost:3000/sensor';

      const params = {
        sortField: orderBy,
        sortOrder: order,
        page: page + 1,
        limit: rowsPerPage,
      };

      const response = await axios.get(url, { params });
      setRows(response.data.data || response.data);
      setTotalRecords(response.data.totalRecords);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, orderBy, order, isSearching]);

  useEffect(() => {
    setIsSearching(false); // Đặt lại isSearching thành false khi searchType thay đổi
  }, [searchType]);

  useEffect(() => {
    if (searchValue) {
      setIsSearching(false);  // Đặt trạng thái tìm kiếm là true khi có giá trị tìm kiếm
      setPage(0);  // Reset trang về đầu
    }
  }, [searchValue]);  // Khi `searchValue` thay đổi, sẽ gọi lại hàm tìm kiếm
  const handleSearch = async () => {
    setIsSearching(true);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <div>
      <div className={classes.filterContainer}>
        <div className={classes.filterRow}>
          <FormControl variant="outlined">
            <InputLabel>Loại Tìm Kiếm</InputLabel>
            <Select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              label="Loại Tìm Kiếm"
              style={{ minWidth: 125 }}
            >
              <MenuItem value="id">ID</MenuItem>
              <MenuItem value="temperature">Nhiệt độ</MenuItem>
              <MenuItem value="humidity">Độ ẩm</MenuItem>
              <MenuItem value="light">Ánh sáng</MenuItem>
              <MenuItem value="windspeed">Tốc độ gió</MenuItem> {/* Thêm tùy chọn Tốc độ gió */}
              <MenuItem value="sound">Âm thanh</MenuItem> {/* Thêm tùy chọn Âm thanh */}
              <MenuItem value="air">Không khí</MenuItem> {/* Thêm tùy chọn Không khí */}
              <MenuItem value="time">Thời gian đo</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Giá trị Tìm Kiếm"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            className={classes.filterButton}
            onClick={handleSearch}
          >
            Tìm Kiếm
          </Button>
        </div>
      </div>
      
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className={classes.centerText}>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleRequestSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell className={classes.centerText}>
                <TableSortLabel
                  active={orderBy === 'temperature'}
                  direction={orderBy === 'temperature' ? order : 'asc'}
                  onClick={() => handleRequestSort('temperature')}
                >
                  Nhiệt độ (°C)
                </TableSortLabel>
              </TableCell>
              <TableCell className={classes.centerText}>
                <TableSortLabel
                  active={orderBy === 'humidity'}
                  direction={orderBy === 'humidity' ? order : 'asc'}
                  onClick={() => handleRequestSort('humidity')}
                >
                  Độ ẩm (%)
                </TableSortLabel>
              </TableCell>
              <TableCell className={classes.centerText}>
                <TableSortLabel
                  active={orderBy === 'light'}
                  direction={orderBy === 'light' ? order : 'asc'}
                  onClick={() => handleRequestSort('light')}
                >
                  Ánh sáng (lux)
                </TableSortLabel>
              </TableCell>
              <TableCell className={classes.centerText}>
                <TableSortLabel
                  active={orderBy === 'windspeed'}
                  direction={orderBy === 'windspeed' ? order : 'asc'}
                  onClick={() => handleRequestSort('windspeed')}
                >
                  Tốc độ gió (m/s)
                </TableSortLabel>
              </TableCell>
              <TableCell className={classes.centerText}>
                <TableSortLabel
                  active={orderBy === 'sound'}
                  direction={orderBy === 'sound' ? order : 'asc'}
                  onClick={() => handleRequestSort('sound')}
                >
                  Âm thanh (dB)
                </TableSortLabel>
              </TableCell>
              <TableCell className={classes.centerText}>
                <TableSortLabel
                  active={orderBy === 'air'}
                  direction={orderBy === 'air' ? order : 'asc'}
                  onClick={() => handleRequestSort('air')}
                >
                  Không khí (ppm)
                </TableSortLabel>
              </TableCell>
              <TableCell className={classes.centerText}>
                <TableSortLabel
                  active={orderBy === 'time'}
                  direction={orderBy === 'time' ? order : 'asc'}
                  onClick={() => handleRequestSort('time')}
                >
                  Thời gian đo
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell className={classes.centerText}>{row.id}</TableCell>
                <TableCell className={classes.centerText}>{row.temperature}</TableCell>
                <TableCell className={classes.centerText}>{row.humidity}</TableCell>
                <TableCell className={classes.centerText}>{row.light}</TableCell>
                <TableCell className={classes.centerText}>{row.windspeed}</TableCell> {/* Dữ liệu Tốc độ gió */}
                <TableCell className={classes.centerText}>{row.sound}</TableCell> {/* Dữ liệu Âm thanh */}
                <TableCell className={classes.centerText}>{row.air}</TableCell> {/* Dữ liệu Không khí */}
                <TableCell className={classes.centerText}>{row.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalRecords}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
}
