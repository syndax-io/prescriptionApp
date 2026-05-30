
set -e

echo "🚀 Setting up GitHub authentication in the container..."

# 1. Install git (if missing)
if ! command -v git >/dev/null 2>&1; then
  echo "→ Installing git..."
  apt-get update -qq && apt-get install -y git
fi

# 2. Install GitHub CLI (gh) using the official method (latest version)
if ! command -v gh >/dev/null 2>&1; then
  echo "→ Installing GitHub CLI (gh)..."
  apt-get update -qq
  apt-get install -y curl
  mkdir -p -m 755 /etc/apt/keyrings
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null
  chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  apt-get update -qq
  apt-get install -y gh
  echo "→ GitHub CLI installed."
fi

# 3. Set your git identity (only if not already configured)
if [ -z "$(git config --global user.name)" ]; then
  read -rp "Enter your full name for git commits: " name
  git config --global user.name "$name"
fi
if [ -z "$(git config --global user.email)" ]; then
  read -rp "Enter your email for git commits: " email
  git config --global user.email "$email"
fi

# 4. Quick login using your Personal Access Token (PAT)
echo ""
echo "🔑 GitHub login"
echo "   1. Go to: https://github.com/settings/tokens"
echo "   2. Click 'Generate new token (classic)'"
echo "   3. Give it a name, select scope → 'repo' (full control of private repositories)"
echo "   4. Generate and copy the token (starts with ghp_)"
echo ""

read -s -p "Paste your GitHub Personal Access Token: " TOKEN
echo

echo "$TOKEN" | gh auth login --with-token

# 5. Tell git to use gh as the credential helper (this is the magic part)
gh auth setup-git

echo ""
echo "✅ SUCCESS! You are now logged in as $(gh auth status | grep -o 'Logged in to github.com as .*' || echo 'your GitHub account')"
echo ""
echo "You can now push and pull changes normally:"
echo "   git push"
echo "   git pull"
echo ""
echo "Test it quickly:"
echo "   gh auth status"
echo ""
echo "💡 Tip: The token is securely managed by gh — no plain-text storage."
