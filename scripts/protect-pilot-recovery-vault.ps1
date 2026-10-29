[CmdletBinding()]
param(
 [string]$VaultPath,
 [switch]$SelfTest
)
$ErrorActionPreference='Stop'
$stage='platform_check';$dirMade=$false;$fileMade=$false;$plain=$null;$pb=$null;$cb=$null;$rb=$null;$s=$null
function Get-SafeCategory([string]$name){switch($name){
 'platform_check'{'powershell_platform_unsupported'}
 'assembly_load'{'dpapi_assembly_load_failed'}
 'profile_lookup'{'user_profile_unavailable'}
 'path_validation'{'vault_path_rejected'}
 'identity_acquisition'{'windows_identity_unavailable'}
 'directory_exists'{'vault_directory_exists'}
 'directory_acl'{'directory_acl_failed'}
 'directory_acl_verify'{'directory_acl_verification_failed'}
 'payload_read'{'payload_input_failed'}
 'payload_validation'{'payload_validation_failed'}
 'dpapi_encrypt'{'dpapi_encryption_failed'}
 'file_create'{'vault_file_create_failed'}
 'file_write'{'vault_file_write_failed'}
 'file_read'{'vault_file_read_failed'}
 'dpapi_decrypt'{'dpapi_decryption_failed'}
 'roundtrip_compare'{'decrypt_compare_failed'}
 'test_cleanup'{'vault_test_cleanup_failed'}
 default{'vault_helper_failed'}
}}
function Remove-OwnedTestArtifacts {
 if($fileMade-and [IO.File]::Exists($file)){[IO.File]::Delete($file);$fileMade=$false}
 if($dirMade-and [IO.Directory]::Exists($dir)){[IO.Directory]::Delete($dir,$false);$dirMade=$false}
}
try{
 if([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT){throw 'unsupported'}
 $stage='assembly_load';Add-Type -AssemblyName System.Security
 $stage='profile_lookup';$local=[Environment]::GetFolderPath([Environment+SpecialFolder]::LocalApplicationData);if(!$local){throw 'unavailable'}
 $stage='path_validation';if($SelfTest-and $VaultPath){throw 'self test forbids explicit vault path'};if(-not $SelfTest-and -not $VaultPath){throw 'vault path required'}
 $dir=[IO.Path]::GetFullPath((Join-Path $local 'VitaReale\AdminRecovery-v2'));$file=[IO.Path]::GetFullPath((Join-Path $dir 'replacement.dpapi'))
 if(-not $SelfTest-and (-not [IO.Path]::IsPathRooted($VaultPath)-or -not [string]::Equals([IO.Path]::GetFullPath($VaultPath),$file,[StringComparison]::OrdinalIgnoreCase))){throw 'target rejected'}
 $stage='directory_exists';if([IO.Directory]::Exists($dir)-or [IO.File]::Exists($dir)-or [IO.File]::Exists($file)){throw 'fresh recovery directory already exists'}
 $stage='identity_acquisition';$identity=[Security.Principal.WindowsIdentity]::GetCurrent();$user=$identity.User;if(!$user){throw 'identity unavailable'};$system=New-Object Security.Principal.SecurityIdentifier('S-1-5-18')
 $acl=New-Object Security.AccessControl.DirectorySecurity;$acl.SetAccessRuleProtection($true,$false);$acl.SetOwner($user)
 $acl.AddAccessRule((New-Object Security.AccessControl.FileSystemAccessRule($user,'FullControl','ContainerInherit,ObjectInherit','None','Allow')))
 $acl.AddAccessRule((New-Object Security.AccessControl.FileSystemAccessRule($system,'FullControl','ContainerInherit,ObjectInherit','None','Allow')))
 $stage='directory_acl';[void][IO.Directory]::CreateDirectory($dir,$acl);$dirMade=$true
 $stage='directory_acl_verify';$actual=Get-Acl -LiteralPath $dir;$rules=@($actual.Access);$userRule=$false;$systemRule=$false
 if(-not $actual.AreAccessRulesProtected-or $actual.GetOwner([Security.Principal.SecurityIdentifier]).Value -ne $user.Value-or $rules.Count -ne 2){throw 'directory ACL mismatch'}
 foreach($rule in $rules){$sid=$rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value;if($rule.IsInherited-or $rule.AccessControlType -ne [Security.AccessControl.AccessControlType]::Allow-or ($rule.FileSystemRights -band [Security.AccessControl.FileSystemRights]::FullControl) -ne [Security.AccessControl.FileSystemRights]::FullControl){throw 'directory ACL rule mismatch'};if($sid -eq $user.Value){$userRule=$true}elseif($sid -eq 'S-1-5-18'){$systemRule=$true}else{throw 'directory ACL principal mismatch'}}
 if(-not $userRule-or -not $systemRule){throw 'directory ACL principal missing'}
 if($SelfTest){
  $stage='payload_validation';$p=[pscustomobject]@{formatVersion=1;project='vita-reale-arabic-demo';team='team_1iIo3BfW8Vk8BduLPPTbgnpv';branch='br-old-shape-b9onuuiu';database='vita_reale_test';adminId='00000000-0000-4000-8000-000000000001';adminKey=('A'*43);authSecret=('B'*43);requestId='00000000-0000-4000-8000-000000000002';createdAt='2026-01-01T00:00:00.000Z';expiresAt='2026-01-31T00:00:00.000Z';purpose='synthetic-dpapi-vault-self-test'};$plain=ConvertTo-Json -InputObject $p -Compress
 }else{$stage='payload_read';$plain=[Console]::In.ReadToEnd()}
 if(!$plain-or $plain.Length -gt 4096){throw 'payload rejected'};$p=ConvertFrom-Json -InputObject $plain;$names=@($p.PSObject.Properties|%{$_.Name})
 $expected=@('formatVersion','project','team','branch','database','adminId','adminKey','authSecret','requestId','createdAt','expiresAt','purpose');$wantedPurpose=if($SelfTest){'synthetic-dpapi-vault-self-test'}else{'owner-authorized-isolated-demo-auth-and-admin-recovery'}
 if(@(Compare-Object $expected $names).Count -ne 0-or $p.formatVersion -ne 1-or $p.project -ne 'vita-reale-arabic-demo'-or $p.team -ne 'team_1iIo3BfW8Vk8BduLPPTbgnpv'-or $p.branch -ne 'br-old-shape-b9onuuiu'-or $p.database -ne 'vita_reale_test'-or $p.purpose -ne $wantedPurpose-or $p.adminId -notmatch '^[0-9a-fA-F-]{36}$'-or $p.requestId -notmatch '^[0-9a-fA-F-]{36}$'-or $p.adminKey -notmatch '^[A-Za-z0-9_-]{43}$'-or $p.authSecret -notmatch '^[A-Za-z0-9_-]{43}$'-or $p.adminKey -ceq $p.authSecret-or [string]::IsNullOrWhiteSpace([string]$p.createdAt)-or [string]::IsNullOrWhiteSpace([string]$p.expiresAt)){throw 'payload rejected'}
 $pb=[Text.Encoding]::UTF8.GetBytes($plain);$stage='dpapi_encrypt';$cb=[Security.Cryptography.ProtectedData]::Protect($pb,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)
 $stage='file_create';$s=[IO.File]::Open($file,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None);$fileMade=$true;$s.Dispose();$s=$null
 # replacement.dpapi inherits only the verified owner and SYSTEM ACEs from
 # the newly created protected recovery directory.
 $stage='file_write';$s=[IO.File]::Open($file,[IO.FileMode]::Open,[IO.FileAccess]::Write,[IO.FileShare]::None);if($s.Length -ne 0){throw 'unexpected file data'};$s.Write($cb,0,$cb.Length);$s.Flush();$s.Dispose();$s=$null
 $stage='file_read';$disk=[IO.File]::ReadAllBytes($file)
 $stage='dpapi_decrypt';$rb=[Security.Cryptography.ProtectedData]::Unprotect($disk,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser);$r=[Text.Encoding]::UTF8.GetString($rb)
 $stage='roundtrip_compare';if($r -cne $plain){throw 'roundtrip mismatch'};$q=ConvertFrom-Json $r;if($q.adminKey -cne $p.adminKey-or $q.authSecret -cne $p.authSecret){throw 'comparison mismatch'}
 if($SelfTest){$stage='test_cleanup';Remove-OwnedTestArtifacts}
 $p=$null;$q=$null;$r=$null;[Console]::Out.Write('{"protected":true,"category":"roundtrip_verified"}')
}catch{
 $category=Get-SafeCategory $stage
 if($SelfTest-and $dirMade){try{$stage='test_cleanup';Remove-OwnedTestArtifacts}catch{$category='vault_test_cleanup_failed'}}
 [Console]::Out.Write('{"protected":false,"category":"'+$category+'"}');exit 1
}finally{if($s){$s.Dispose()};if($pb){[Array]::Clear($pb,0,$pb.Length)};if($cb){[Array]::Clear($cb,0,$cb.Length)};if($rb){[Array]::Clear($rb,0,$rb.Length)};$plain=$null}
