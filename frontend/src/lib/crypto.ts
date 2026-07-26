/* #########     Decryption Module u can do the encryption module above it      #############               */
/*
things i have to do for decrypt 
1. get teh password and then  use base64Unity8Array() function to convert salt and IV from text to binary 
2.  then textEncoder().encode()  convert password text to binary 
3. and then crypto.subtle.importKey() to turn the password into a key material
4. then crypto.subtle.deriveKey()  it runs the PBKDF2 to get the AESs key from the binary converted password 
5. crypto.subtle.decrypt()  it uses AES - GCM mode  to decypt the file 


this all are  libaries  already exists in the broswer   we are doing broswer side decryption here 

*/

/*
step 1: convert the base64 salt and iv to unity8Array (binary data)  because crypto api needs binary data
converts a based64 string to a unity8Array (binary data)
Base64 is text-safe  Binary data is what the crypto API needs so 

*/

function base64ToUint8Array(base64:string):Uint8Array{  //Unity8Array is a typed array that represents an array of 8-bit unsigned integers. It is used to handle binary data in JavaScript
    const binaryString = atob(base64);   //atob means "ASCII to binary" it converts base64 string to binary string
    const bytes=new Uint8Array(binaryString.length); 
    for(let i=0; i< binaryString.length; i++){
        bytes[i]=binaryString.charCodeAt(i);  //charCodeAt() returns the Unicode of the character at the specified index in a string
    }
return bytes;
}


/*
Decrypts a file using AES-GCM with a password-derived key 
this funciton is gona be same as how encryption works but use decrypt here 

@param  | encryptedData - the encrypted file  bytes from S3
@param  | passowrd - the user's password 
@param  | saltBase64 - Base64-encoded salt used for key derivation 
@param  | ivBase64 - Base64-encodeded  IV from database
@returns| the orginal, decrypted file bytes





  EXTRA info y i chose and wt  
  | Concept               | Analogy                                 | What It Actually Is                                    |
| --------------------- | --------------------------------------- | ------------------------------------------------------ |
| **ArrayBuffer**       | The warehouse building itself           | A raw chunk of memory (bytes)                          |
| **Uint8Array**        | The shelving system inside              | A way to read that memory as numbered boxes (0–255)    |
| **SharedArrayBuffer** | A warehouse multiple trucks use at once | Memory shared between browser tabs/workers             |
| **BufferSource**      | "Any building with shelves"             | TypeScript's way of saying "ArrayBuffer OR Uint8Array" |
| **`as any`**          | "Trust me, I checked the paperwork"     | Tells TypeScript to stop being paranoid                |




| Approach          | What It Does                                 | When To Use                                                 |
| ----------------- | -------------------------------------------- | ----------------------------------------------------------- |
| `as Uint8Array`   | "Trust me, it's a Uint8Array"                | Didn't work because Uint8Array is still generic             |
| `as BufferSource` | "Trust me, it's valid binary data"           | Better, but still might fail in strict mode                 |
| `as any`          | "Trust me, it's whatever the function needs" | ✅ Guaranteed to work, use when you KNOW the data is correct |

*/

export async function decryptFile(
    encryptedData:ArrayBuffer,
    password:string,
    saltBase64:string,
    ivBase64:string
):Promise<ArrayBuffer> {  // this promise array buffer is 

    
//step 1: Decode salt and IV from Base64 to binary
 const salt = base64ToUint8Array(saltBase64)as BufferSource;
 const iv = base64ToUint8Array(ivBase64)as BufferSource;
//step 2: Encode password as bytes 
const passwordBytes=new TextEncoder().encode(password);

//step 3: Import password as PBKDF2 key material
const passwordkey =await crypto.subtle.importKey(
    "raw",                  // the password as raw bytes
    passwordBytes,          //the password bytes
    "PBKDF2",               // we are using PBKDF2 to derive a key from the password
    false,                  //the key is not extractable (cannot be exported)
    ["deriveKey"]           //we  use it to derive another key from it 
    
);


//step 4" derive the AES key using PBKDF2 
//Same parameters as encryption : same salt, 100k for now then 600k  iterations, SHA-256
const aeskey=await crypto.subtle.deriveKey(
    {
        name:"PBKDF2",    //
        salt: salt,        // same salt used during encryption 
        iterations:100000,    //same iteration count
        hash: "SHA-256",         //Same hash function
    },

    passwordkey,         //the password key we imported
    {name:"AES-GCM", length:256},  //we want a 256-bit AES key 
    false,                         //The AES key is not extractable
    ["decrypt"]                    // we will use it for decryption 
);


//step 5: Decryption the file using AES-GCM 
const decryptedData= await crypto.subtle.decrypt(
    {
     name:"AES-GCM",
      iv: iv,                         //same IV used during encryption 
    },
    aeskey,                    //the derived AES key 
    encryptedData               // the encrypted file data from S3
);

return decryptedData;


}


