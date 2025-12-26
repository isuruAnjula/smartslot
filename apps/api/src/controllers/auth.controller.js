const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function setAuthCookie(res, token) {
  res.cookie("access_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true in production (https)
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

exports.register = async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken(user);
  setAuthCookie(res, token);

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

exports.login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user);
  setAuthCookie(res, token);

  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

exports.logout = async (req, res) => {
  res.clearCookie("access_token");
  res.json({ ok: true });
};

exports.me = async (req, res) => {
  // req.user comes from auth middleware (we add next)
  res.json({ user: req.user });
};
