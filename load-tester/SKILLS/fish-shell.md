# Fish Shell Syntax

> **Critical**: This developer uses Fish shell on macOS, NOT bash. Fish syntax differs significantly.

---

## Quick Reference: Fish vs Bash

| Operation | Bash | Fish |
|-----------|------|------|
| Set variable | `export VAR=value` | `set -x VAR value` |
| Local variable | `VAR=value` | `set VAR value` |
| Command substitution | `$(command)` | `(command)` |
| Conditionals | `if [ -f file ]; then ... fi` | `if test -f file; ...; end` |
| Logical AND | `cmd1 && cmd2` | `cmd1; and cmd2` or `cmd1 && cmd2` (Fish 3.0+) |
| Logical OR | `cmd1 \|\| cmd2` | `cmd1; or cmd2` or `cmd1 \|\| cmd2` (Fish 3.0+) |
| For loop | `for i in 1 2 3; do ... done` | `for i in 1 2 3; ...; end` |
| Functions | `function name() { ... }` | `function name; ...; end` |
| Exit status | `$?` | `$status` |
| String test | `[ "$var" = "value" ]` | `test "$var" = "value"` |

---

## Common Operations

### Environment Variables

```fish
# Set for current session
set -x DATABASE_URL "file:./prisma/dev.db"

# Set permanently (adds to config)
set -Ux DATABASE_URL "file:./prisma/dev.db"

# Unset
set -e DATABASE_URL

# View
echo $DATABASE_URL
```

### Running Commands

```fish
# Chain commands (both work in Fish 3.0+)
npm install && npm run dev
npm install; and npm run dev

# Run in background
npm run dev &

# Redirect output
npm test > output.txt 2>&1
npm test 2>/dev/null  # Suppress errors
```

### Conditionals

```fish
# Check if command succeeded
if npm test
    echo "Tests passed"
else
    echo "Tests failed"
end

# Check file exists
if test -f package.json
    echo "Found package.json"
end

# Check variable
if test -n "$DATABASE_URL"
    echo "DATABASE_URL is set"
end

# Check exit status
npm test
if test $status -eq 0
    echo "Success"
end
```

### Loops

```fish
# For loop
for file in *.js
    echo "Processing $file"
end

# While loop
while true
    npm run dev
    sleep 1
end

# Loop with index
for i in (seq 1 10)
    echo "Iteration $i"
end
```

### String Operations

```fish
# Concatenation (just place next to each other)
set full_path "$HOME/projects/$name"

# String contains
if string match -q "*error*" $output
    echo "Found error"
end

# String replace
set new_string (string replace "old" "new" $original)

# Split string
set parts (string split "/" $path)
```

### Command Substitution

```fish
# Capture command output
set current_branch (git branch --show-current)
set file_count (ls | wc -l)

# Use in command
echo "On branch: $current_branch"
cd (dirname $path)
```

### Path and Directory

```fish
# Change directory
cd ~/workspace/load-tester

# Make directory
mkdir -p apps/backend/src

# Current directory
echo $PWD
# or
pwd

# Home directory
echo $HOME
cd ~
```

---

## Common Mistakes to Avoid

### ❌ Wrong: Bash-style variable assignment
```bash
# This does NOT work in Fish
export DATABASE_URL=value
VAR=value command
```

### ✅ Correct: Fish-style
```fish
set -x DATABASE_URL value
env VAR=value command
# or
begin; set -lx VAR value; command; end
```

### ❌ Wrong: Bash-style command substitution
```bash
# This does NOT work in Fish
result=$(echo hello)
```

### ✅ Correct: Fish-style
```fish
set result (echo hello)
```

### ❌ Wrong: Bash-style conditionals
```bash
# This does NOT work in Fish
if [ -f file ]; then
    echo "exists"
fi
```

### ✅ Correct: Fish-style
```fish
if test -f file
    echo "exists"
end
```

### ❌ Wrong: Bash-style function
```bash
# This does NOT work in Fish
function greet() {
    echo "Hello $1"
}
```

### ✅ Correct: Fish-style
```fish
function greet
    echo "Hello $argv[1]"
end
```

---

## This Project's Common Commands

### Development

```fish
# Start both frontend and backend
cd ~/workspace/agent/load-tester
npm run dev

# Start just backend
npm run backend

# Start just frontend
npm run frontend
```

### Testing

```fish
# All tests
npm run test:all

# Backend tests
npm run backend:test
npm run backend:test:unit
npm run backend:test:integration

# Frontend tests
npm run frontend:test
```

### Database

```fish
cd apps/backend

# Full setup (migrate + generate)
npm run db:setup

# Individual commands
npm run prisma:migrate
npm run prisma:generate
npm run prisma:studio
```

### Checking for Issues

```fish
# Check for running processes on ports
lsof -i :3001  # Backend
lsof -i :5173  # Frontend

# Kill process on port
kill (lsof -t -i :3001)

# Check node version
node --version
npm --version
```

---

## Fish Configuration

Fish config is at `~/.config/fish/config.fish`

Common additions:
```fish
# Node version manager (if using nvm)
# Note: nvm doesn't work in Fish, use nvm.fish or fnm instead

# Aliases
alias ll "ls -la"
alias gs "git status"
alias gd "git diff"

# Path additions
fish_add_path ~/bin
```
