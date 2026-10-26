param([Parameter(Mandatory=$true)][string]$VaultPath)
$ErrorActionPreference='Stop'
try {
 if (-not $IsWindows -or [IO.File]::Exists($VaultPath) -or -not [IO.Path]::IsPathFullyQualified($VaultPath)) { throw 'Vault unavailable' }
 $plain=[Console]::In.ReadToEnd()
 $secure=ConvertTo-SecureString -String $plain -AsPlainText -Force
 $encrypted=ConvertFrom-SecureString -SecureString $secure
 [IO.File]::WriteAllText($VaultPath,$encrypted,[Text.Encoding]::UTF8)
 $acl=[Security.AccessControl.FileSecurity]::new()
 $acl.SetAccessRuleProtection($true,$false)
 $sid=[Security.Principal.WindowsIdentity]::GetCurrent().User
 $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($sid,'FullControl','Allow'))
 $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new('S-1-5-18'),'FullControl','Allow'))
 Set-Acl -LiteralPath $VaultPath -AclObject $acl
 $roundtrip=ConvertTo-SecureString -String ([IO.File]::ReadAllText($VaultPath))
 $ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($roundtrip)
 try { if ([Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) -cne $plain) { throw 'Vault unavailable' } }
 finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
 $plain=$null
 [Console]::Out.Write('{"protected":true}')
} catch { [Console]::Out.Write('{"protected":false}'); exit 1 }
