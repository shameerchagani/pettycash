$(document).ready( function () {
    $('#table1').DataTable({
      "aLengthMenu": [[-1, 10, 25, 50, 100], ['All',"10 Per Page", "25 Per Page", "50 Per Page", "100 Per Page"]]
    });
} );