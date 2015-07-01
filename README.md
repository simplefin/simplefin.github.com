bundle jekyll serve

Remake table of contents:

  # npm install doctoc
  doctoc protocol.md

#### Python Reference

Here's an example of using the [`ecdsa`](https://pypi.python.org/pypi/ecdsa/) and [`pyjwt`](https://github.com/jpadilla/pyjwt) Python libraries to generate a setup token:

{% highlight bash %}
pip install pyjwt ecdsa
{% endhighlight %}

{% highlight python %}
# on the SimpleFIN Server
from uuid import uuid4
from ecdsa import SigningKey


key_database = {}

def generateSetupToken(internal_user_id):
    token_id = str(uuid.uuid4())
    private_key = SigningKey.generate()
    public_key = private_key.get_verifying_key()

    # save for verifying later
    key_database[token_id] = public_key.to_string().encode('hex')

    return json.dumps({
        'id': token_id,
        'secret': private_key.to_string().encode('hex'),
        'url': 'https://simplefin.example.com',
    }).encode('base64')

{% endhighlight %}

{% highlight python %}
# on a Consumer
private_pem = SigningKey.from_string('044be9c05ac12793a1deeb1c983539f3db0d3fb853bdc83b'.decode('hex')).to_pem()

# ...
# back on the server
assert public_key.verify(signature, "message")
{% endhighlight %}



### 

from ecdsa import SigningKey
import jwt
secret = "044be9c05ac12793a1deeb1c983539f3db0d3fb853bdc83b"
data = {
  "id": "6e71a22a6ce9458b9897242423734d9c",
  "iat": 1435724162,
  "exp": 1435724222
}
key = SigningKey.from_string(secret.decode('hex')).to_pem()
jwt.encode(data, key, algorithm='ES256')





from Crypto.PublicKey import RSA
>>> RSAkey = RSA.generate(1024)
private = RSA.generate(1024)
>>> public  = private.publickey()
>>> private.exportKey()
'-----BEGIN RSA PRIVATE KEY-----\nMIICXgIBAAKBgQDo1M0P3nryaF8ZITv8vCFVnjUJ1mnIsrqXZRTzjin69xepr3cz\nKicG3EYSUqMODQAsvMj0tGMo+ElGOVOkPFLVVBHd8izgA/E1RqUzbUDMj4WnhlhA\nQq7tNaViOXNaZ7krJZHabZKxfYvLAQtm4tr+m5NtXPBaWvjwhd5M9xvktwIDAQAB\nAoGBANVsS1Rikbymo5V7e2teYAgFb4THAEyyWIvyYlQnWp/r48rtRoyl9QQ64hhl\nm4WDsUdQ/bwhpkul3DT804jWqu2V71p68rQP7h5D6ldCBUr5nQc9o/uEyy4YCgxD\n/ZxNiY5Bb/lMP9nhb2NbG4184mhUMHu+06wWX6RrXQtMtjYhAkEA8DioToMZIy3s\nhPohri3CAgByV2Jxf7JPqVZ93JjlSlBz+aybSv1mOJUPRFpkMk2xiPmHtEn16hYr\nesVK11tcjwJBAPgf4QYAw9dV+DuVqdwz+kmTjnlkr0Q7fjaGfl60DWmuLWmxiRhe\nMYQ2+8iyPDmxcPFTGSpGqyvyJDjQ/wOlWVkCQQCRIuotZW/OnXSFc0reHa9V3kc3\nHLdOW8FdonAw0//Uwn8PnoXE7QzRqt2qgqJ+8goNpBWli/oUEIj8iC8LpptpAkBV\nFFlMfaaph8j+ZWtBHnGMGRSZe3S9qMi2WZerUYHn4tmfjEi+Gk5QT6o2Pyd3gOiB\nV0Uhwemfv/+7m65VybTBAkEA5H59kG+B9HHD5hJtksAtMh8dxk/MI8G0csduU0vu\n7K5ejL522XsHurVrWdqnk6KvjlRXqB4FsMWLE6RBgBNV0A==\n-----END RSA PRIVATE KEY-----'
>>> public.exportKey()
'-----BEGIN PUBLIC KEY-----\