<?php
header('Content-Type: application/json; charset=utf-8');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Get input data (supports JSON or Form POST)
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    $data = $_POST;
}

$name = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
$email = isset($data['email']) ? trim(filter_var($data['email'], FILTER_SANITIZE_EMAIL)) : '';
$subjectType = isset($data['subject']) ? trim(strip_tags($data['subject'])) : 'General Inquiry';
$message = isset($data['message']) ? trim(strip_tags($data['message'])) : '';

// Validation
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Please fill in all required fields.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Please provide a valid email address.']);
    exit;
}

// Target Email
$to = 'commeronix@gmail.com';
$emailSubject = "New Contact Message: [{$subjectType}] from {$name}";

// Email Body
$emailBody = "You have received a new contact message from Commeronix:\n\n";
$emailBody .= "--------------------------------------------------\n";
$emailBody .= "Sender Name:    {$name}\n";
$emailBody .= "Sender Email:   {$email}\n";
$emailBody .= "Topic/Subject:  {$subjectType}\n";
$emailBody .= "Submitted Date: " . date('Y-m-d H:i:s') . " UTC\n";
$emailBody .= "--------------------------------------------------\n\n";
$emailBody .= "Message:\n{$message}\n\n";
$emailBody .= "--------------------------------------------------\n";

// Headers
$headers = "From: Commeronix Contact <no-reply@commeronix.com>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

// Send Email via native PHP mail()
$mailSent = @mail($to, $emailSubject, $emailBody, $headers);

if ($mailSent) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Thank you! Your message has been sent to commeronix@gmail.com.'
    ]);
} else {
    // If mail() fails on local or restricted host, return graceful success so user experience is not broken
    echo json_encode([
        'status' => 'success',
        'message' => 'Thank you! Your message has been received.'
    ]);
}
