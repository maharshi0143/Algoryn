const verifyEmailTemplate = (name, verificationUrl) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>

<body style="font-family:Arial;background:#f5f5f5;padding:40px;">

<div style="
max-width:600px;
margin:auto;
background:white;
border:3px solid black;
border-radius:16px;
box-shadow:8px 8px 0 black;
padding:40px;
">

<h1>🟨 Algoryn</h1>

<h2>Hello ${name} 👋</h2>

<p>
Welcome to <strong>Algoryn</strong>.
</p>

<p>
Click below to verify your email.
</p>

<a
href="${verificationUrl}"
style="
display:inline-block;
padding:14px 28px;
background:#FFD23F;
border:3px solid black;
text-decoration:none;
color:black;
font-weight:bold;
box-shadow:5px 5px 0 black;
margin-top:20px;
">
Verify Email
</a>

<p style="margin-top:25px;">
This link expires in 24 hours.
</p>

</div>

</body>
</html>
`;

module.exports = verifyEmailTemplate;