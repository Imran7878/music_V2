<?php
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['id'])) {
    $id = $conn->real_escape_string($_POST['id']);
    
    // ডাটাবেস থেকে ফাইলের লোকেশন বের করা
    $result = $conn->query("SELECT file_path FROM songs WHERE id = '$id'");
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $filePath = $row['file_path'];
        
        // ফোল্ডার থেকে ফাইলটি ডিলিট করা
        if (file_exists($filePath)) {
            unlink($filePath); 
        }
        
        // ডাটাবেস থেকে ডিলিট করা
        $sql = "DELETE FROM songs WHERE id = '$id'";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Song not found"]);
    }
}
?>