<?php
$host = 'localhost';
$user = 'root'; // আপনার ডাটাবেস ইউজার
$pass = ''; // আপনার ডাটাবেস পাসওয়ার্ড
$dbname = 'audio_db';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>