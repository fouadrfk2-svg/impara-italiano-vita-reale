param([Parameter(Mandatory=$true)][string]$VaultPath)
$ErrorActionPreference = 'Stop'
$created = $false
$plain = $null
$secure = $null
$roundtrip = $null
$ptr = [IntPtr]::Zero
try {
  $expectedDirectory = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'VitaReale\AdminRecovery'))
  $actualDirectory = [IO.Path]::GetFullPath([IO.Path]::GetDirectoryName($VaultPath))
  if (-not $IsWindows -or -not [IO.Path]::IsPathFullyQualified($VaultPath) -or
      [IO.File]::Exists($VaultPath) -or
      -not [string]::Equals($expectedDirectory, $actualDirectory, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Vault unavailable'
  }
  $directory = [IO.Path]::GetDirectoryName($VaultPath)
  if (-not [IO.Directory]::Exists($directory)) { [void][IO.Directory]::CreateDirectory($directory) }
  if (@([IO.Directory]::EnumerateFileSystemEntries($directory)).Count -gt 0) { throw 'Vault unavailable' }
  $dirAcl = Get-Acl -LiteralPath $directory
  $dirAcl.SetAccessRuleProtection($true, $false)
  $dirAcl.Access | ForEach-Object { [void]$dirAcl.RemoveAccessRuleAll($_) }
  $userSid = [Security.Principal.WindowsIdentity]::GetCurrent().User
  $systemSid = [Security.Principal.SecurityIdentifier]::new('S-1-5-18')
  $dirAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($userSid, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow'))
  $dirAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($systemSid, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow'))
  Set-Acl -LiteralPath $directory -AclObject $dirAcl

  $plain = [Console]::In.ReadToEnd()
  if ([string]::IsNullOrWhiteSpace($plain) -or $plain.Length -gt 4096) { throw 'Vault unavailable' }
  $payload = ConvertFrom-Json -InputObject $plain -AsHashtable
  if ($payload.formatVersion -ne 1 -or $payload.project -ne 'vita-reale-arabic-demo' -or
      $payload.branch -ne 'br-old-shape-b9onuuiu' -or $payload.database -ne 'vita_reale_test' -or
      $payload.ContainsKey('authSecret') -or $payload.ContainsKey('databaseUrl') -or
      $payload.ContainsKey('DATABASE_URL') -or $payload.ContainsKey('PILOT_AUTH_SECRET')) {
    throw 'Vault unavailable'
  }
  $stream = [IO.File]::Open($VaultPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
  $stream.Dispose()
  $created = $true

  $acl = Get-Acl -LiteralPath $VaultPath
  $acl.SetAccessRuleProtection($true, $false)
  $acl.Access | ForEach-Object { [void]$acl.RemoveAccessRuleAll($_) }
  $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($userSid, 'FullControl', 'Allow'))
  $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($systemSid, 'FullControl', 'Allow'))
  Set-Acl -LiteralPath $VaultPath -AclObject $acl

  $secure = ConvertTo-SecureString -String $plain -AsPlainText -Force
  $encrypted = ConvertFrom-SecureString -SecureString $secure
  [IO.File]::WriteAllText($VaultPath, $encrypted, [Text.Encoding]::UTF8)
  $roundtrip = ConvertTo-SecureString -String ([IO.File]::ReadAllText($VaultPath))
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($roundtrip)
  $decrypted = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  if ($decrypted -cne $plain) { throw 'Vault unavailable' }
  $decrypted = $null
  $plain = $null
  [Console]::Out.Write('{"protected":true}')
} catch {
  if ($created -and [IO.File]::Exists($VaultPath)) {
    try { [IO.File]::Delete($VaultPath) } catch {}
  }
  [Console]::Out.Write('{"protected":false}')
  exit 1
} finally {
  if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
  if ($secure) { $secure.Dispose() }
  if ($roundtrip) { $roundtrip.Dispose() }
  $plain = $null
}
