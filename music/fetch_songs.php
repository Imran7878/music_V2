<?php
include 'db.php';
$result = $conn->query("SELECT * FROM songs");
$songs =[];
while ($row = $result->fetch_assoc()) {
    $songs[] = $row;
}
echo json_encode($songs);
?>