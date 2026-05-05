<?php
// 1. Connection to Database
$host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "dreamstar_db";

$conn = mysqli_connect($host, $db_user, $db_pass, $db_name);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// 2. Handle Registration
if (isset($_POST['register'])) {
    $user = mysqli_real_escape_string($conn, $_POST['username']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $pass = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (username, email, password) VALUES ('$user', '$email', '$pass')";

    if (mysqli_query($conn, $sql)) {
        echo "<script>alert('Success!'); window.location.href='index.html';</script>";
    } else {
        echo "Error: " . mysqli_error($conn);
    }
}

// 3. Handle Login
if (isset($_POST['login'])) {
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $pass = $_POST['password'];

    $sql = "SELECT * FROM users WHERE email='$email'";
    $result = mysqli_query($conn, $sql);
    $user_data = mysqli_fetch_assoc($result);

    if ($user_data && password_verify($pass, $user_data['password'])) {
        echo "<script>alert('Welcome back!'); window.location.href='index.html';</script>";
    } else {
        echo "<script>alert('Wrong email or password'); window.location.href='index.html';</script>";
    }
}
echo"hello";
error_reporting(E_ALL);
ini_set('display_errors',1);
?>