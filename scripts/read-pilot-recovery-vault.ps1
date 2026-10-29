[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$VaultPath)
$ErrorActionPreference='Stop';$bytes=$null;$plainBytes=$null;$plain=$null;$payload=$null
try{
 if([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT){throw 'platform'}
 Add-Type -AssemblyName System.Security
 $nonce=[Environment]::GetEnvironmentVariable('VITA_PILOT_RECOVERY_BRIDGE_NONCE');if($nonce -notmatch '^[0-9a-f]{48}$'){throw 'bridge'}
 $local=[Environment]::GetFolderPath([Environment+SpecialFolder]::LocalApplicationData);$dir=[IO.Path]::GetFullPath((Join-Path $local 'VitaReale\AdminRecovery-v2'));$file=[IO.Path]::GetFullPath((Join-Path $dir 'replacement.dpapi'))
 if(-not [IO.Path]::IsPathRooted($VaultPath)-or -not [string]::Equals([IO.Path]::GetFullPath($VaultPath),$file,[StringComparison]::OrdinalIgnoreCase)-or -not [IO.File]::Exists($file)){throw 'path'}
 $identity=[Security.Principal.WindowsIdentity]::GetCurrent();$sid=$identity.User;if(!$sid){throw 'identity'};$sidValue=$sid.Value
 $systemSid='S-1-5-18';$directoryAcl=Get-Acl -LiteralPath $dir;$directoryRules=@($directoryAcl.Access)
 if(-not $directoryAcl.AreAccessRulesProtected-or $directoryAcl.GetOwner([Security.Principal.SecurityIdentifier]).Value -ne $sidValue-or $directoryRules.Count -ne 2){throw 'acl'}
 foreach($rule in $directoryRules){$ruleSid=$rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value;if($rule.IsInherited-or $rule.AccessControlType -ne [Security.AccessControl.AccessControlType]::Allow-or ($rule.FileSystemRights -band [Security.AccessControl.FileSystemRights]::FullControl) -ne [Security.AccessControl.FileSystemRights]::FullControl-or @($sidValue,$systemSid) -notcontains $ruleSid){throw 'acl'}}
 $fileAcl=Get-Acl -LiteralPath $file;$fileRules=@($fileAcl.Access)
 if($fileAcl.GetOwner([Security.Principal.SecurityIdentifier]).Value -ne $sidValue-or $fileRules.Count -ne 2){throw 'acl'}
 foreach($rule in $fileRules){$ruleSid=$rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value;if(-not $rule.IsInherited-or $rule.AccessControlType -ne [Security.AccessControl.AccessControlType]::Allow-or ($rule.FileSystemRights -band [Security.AccessControl.FileSystemRights]::FullControl) -ne [Security.AccessControl.FileSystemRights]::FullControl-or @($sidValue,$systemSid) -notcontains $ruleSid){throw 'acl'}}
 $bytes=[IO.File]::ReadAllBytes($file);$plainBytes=[Security.Cryptography.ProtectedData]::Unprotect($bytes,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser);$plain=[Text.Encoding]::UTF8.GetString($plainBytes);$payload=ConvertFrom-Json -InputObject $plain
 $expected=@('formatVersion','project','team','branch','database','adminId','adminKey','authSecret','requestId','createdAt','expiresAt','purpose');$names=@($payload.PSObject.Properties|%{$_.Name})
 if(@(Compare-Object $expected $names).Count -ne 0-or $payload.formatVersion -ne 1-or $payload.project -ne 'vita-reale-arabic-demo'-or $payload.team -ne 'team_1iIo3BfW8Vk8BduLPPTbgnpv'-or $payload.branch -ne 'br-old-shape-b9onuuiu'-or $payload.database -ne 'vita_reale_test'-or $payload.purpose -ne 'owner-authorized-isolated-demo-auth-and-admin-recovery'-or $payload.adminId -notmatch '^[0-9a-fA-F-]{36}$'-or $payload.requestId -notmatch '^[0-9a-fA-F-]{36}$'-or $payload.adminKey -notmatch '^[A-Za-z0-9_-]{43}$'-or $payload.authSecret -notmatch '^[A-Za-z0-9_-]{43}$'-or $payload.adminKey -ceq $payload.authSecret-or [DateTimeOffset]::Parse([string]$payload.expiresAt) -le [DateTimeOffset]::UtcNow){throw 'payload'}
 $safe=[ordered]@{};foreach($name in $expected){$safe[$name]=$payload.$name};$response=[ordered]@{status='PASS';bridgeNonce=$nonce;payload=$safe};[Console]::Out.Write((ConvertTo-Json -InputObject $response -Compress -Depth 4))
}catch{
 $category=if($_.Exception.Message -eq 'acl'){'vault_acl_invalid'}elseif($_.Exception.Message -eq 'payload'){'vault_payload_invalid'}else{'vault_read_failed'}
 [Console]::Out.Write((ConvertTo-Json -InputObject @{status='FAIL';category=$category} -Compress));exit 1
}finally{if($bytes){[Array]::Clear($bytes,0,$bytes.Length)};if($plainBytes){[Array]::Clear($plainBytes,0,$plainBytes.Length)};$plain=$null;$payload=$null}
