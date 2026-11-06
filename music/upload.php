<?php
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // ফাইল সাইজ বড় হওয়ার কারণে যদি ফাইল না আসে
    if (!isset($_FILES['audio_file'])) {
        echo json_encode(["status" => "error", "message" => "No file received. Check file size!"]);
        exit;
    }

    $target_dir = "uploads/";
    // ফোল্ডার না থাকলে অটোমেটিক তৈরি করবে
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true); 
    }

    // ফাইলের নাম থেকে স্পেস বা স্পেশাল ক্যারেক্টার বাদ দেওয়া
    $file_name = basename($_FILES["audio_file"]["name"]);
    $safe_file_name = preg_replace("/[^a-zA-Z0-9.]/", "_", $file_name);
    $target_file = $target_dir . time() . "_" . $safe_file_name;

    if (move_uploaded_file($_FILES["audio_file"]["tmp_name"], $target_file)) {
        $title = $conn->real_escape_string($_POST['title']);
        $sql = "INSERT INTO songs (title, file_path) VALUES ('$title', '$target_file')";
        
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to move file to uploads folder."]);
    }
}
?>