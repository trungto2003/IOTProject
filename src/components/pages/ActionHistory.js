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
  filterContainer: { padding: '16px', display: 'flex', alignItems: 'center' },
  filterButton: { marginLeft: '16px' },
});

export default function DeviceStatusTable() {
  const classes = useStyles();
  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchType, setSearchType] = useState('id');
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id'); 
  const [isSearching, setIsSearching] = useState(false); // thêm cờ kiểm tra có tìm kiếm hay không

  // Hàm gọi API để lấy dữ liệu
  const fetchData = async () => {
    try {
      const url = isSearching
        ? `http://localhost:3000/action/type=${searchType}&input=${searchValue}`
        : 'http://localhost:3000/action';

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
  }, [orderBy, order, page, rowsPerPage, isSearching]);

  // Gọi tìm kiếm lại khi `searchType` thay đổi
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
    setIsSearching(true); // bật cờ tìm kiếm
    setPage(0); // reset về trang 0 khi tìm kiếm
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
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
        <FormControl variant="outlined">
          <InputLabel>Loại Tìm Kiếm</InputLabel>
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            label="Loại Tìm Kiếm"
            style={{ minWidth: 125 }}
          >
            <MenuItem value="id">ID</MenuItem>
            <MenuItem value="device_id">Thiết bị</MenuItem>
            <MenuItem value="status">Hành động</MenuItem>
            <MenuItem value="time">Thời gian</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Giá trị Tìm Kiếm"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ marginLeft: '400px' }}
        />
        <Button
          variant="contained"
          color="primary"
          className={classes.filterButton}  
          style={{ marginLeft: '250px' }}
          onClick={handleSearch} // Thêm sự kiện onClick để thực hiện tìm kiếm
        >
          Tìm Kiếm
        </Button>
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
              <TableCell className={classes.centerText}>Thiết bị</TableCell>
              <TableCell className={classes.centerText}>Hành động</TableCell>
              <TableCell className={classes.centerText}>
                <TableSortLabel
                  active={orderBy === 'time'}
                  direction={orderBy === 'time' ? order : 'asc'}
                  onClick={() => handleRequestSort('time')}
                >
                  Thời gian
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className={classes.centerText}>{row.id}</TableCell>
                <TableCell className={classes.centerText}>
                  {row.device_id === 'fan' ? 'Fan' :
                  row.device_id === 'led' ? 'Led' :
                  row.device_id === 'ac' ? 'AC' :
                  row.device_id}
                </TableCell>
                <TableCell className={classes.centerText}>
                  {row.status === 'on' ? 'On' :
                    row.status === 'off' ? 'Off' :
                    row.status}
                   </TableCell>
                <TableCell className={classes.centerText}>{row.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalRecords}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
  );
}
