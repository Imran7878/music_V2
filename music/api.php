<?php
$host = 'localhost';
$user = 'root'; // আপনার ডাটাবেজ ইউজারনেম
$pass = '';     // আপনার ডাটাবেজ পাসওয়ার্ড
$dbname = 'audio_visualizer';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

$action = $_GET['action'] ?? '';

// ১. ফাইল আপলোড
if ($action == 'upload') {
    if (isset($_FILES['audio'])) {
        $file = $_FILES['audio'];
        $fileName = basename($file['name']);
        $targetPath = "uploads/" . time() . "_" . $fileName; // Unique Name

        // শুধু অডিও ফাইল অ্যালাউ করা
        $fileType = strtolower(pathinfo($targetPath, PATHINFO_EXTENSION));
        if (in_array($fileType,['mp3', 'wav', 'ogg'])) {
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $stmt = $conn->prepare("INSERT INTO songs (title, file_path) VALUES (?, ?)");
                $stmt->bind_param("ss", $fileName, $targetPath);
                $stmt->execute();
                echo json_encode(['status' => 'success']);
                exit;
            }
        }
        echo json_encode(['status' => 'error', 'msg' => 'Invalid file']);
    }
} 
// ২. গানের লিস্ট পাঠানো
elseif ($action == 'list') {
    $result = $conn->query("SELECT * FROM songs ORDER BY uploaded_at DESC");
    $songs =[];
    while ($row = $result->fetch_assoc()) {
        $songs[] = $row;
    }
    echo json_encode($songs);
} 
// ৩. গান ডিলিট করা
elseif ($action == 'delete') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'];
    
    $result = $conn->query("SELECT file_path FROM songs WHERE id=$id");
    if ($row = $result->fetch_assoc()) {
        if (file_exists($row['file_path'])) {
            unlink($row['file_path']); // ফাইল ডিলিট
        }
        $conn->query("DELETE FROM songs WHERE id=$id"); // ডাটাবেজ থেকে ডিলিট
        echo json_encode(['status' => 'success']);
    }
}
?>