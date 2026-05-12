$f = 'c:\Users\josueolmedo\Documents\Josue\Proyectos\Intercambios familiares\js\app.js'
$c = [IO.File]::ReadAllText($f)

# Add unlock button next to reset password in member row
$old = '<button class="btn btn-sm btn-gold" onclick="resetPassword('"'"'${f.id}'"'"','"'"'${m.id}'"'"')" title="Reset password"><i class="fas fa-key"></i></button>'
$new = '<button class="btn btn-sm btn-gold" onclick="resetPassword('"'"'${f.id}'"'"','"'"'${m.id}'"'"')" title="Reset password"><i class="fas fa-key"></i></button><button class="btn btn-sm btn-secondary" onclick="unlockMember('"'"'${m.id}'"'"')" title="Unlock list"><i class="fas fa-lock-open"></i></button>'
$c = $c.Replace($old, $new)

# Add unlockMember function after resetPassword
$old2 = '// ==================== EXTRA REQUESTS ===================='
$new2 = '// ==================== UNLOCK MEMBER ====================
async function unlockMember(memberId) {
  if (!confirm("Unlock this member list? (remove purchased status)")) return;
  await CloudStorage.setPurchased(memberId, null);
  toast("Unlocked", "success");
}

// ==================== EXTRA REQUESTS ===================='
$c = $c.Replace($old2, $new2)

[IO.File]::WriteAllText($f, $c)
Write-Host "DONE"
