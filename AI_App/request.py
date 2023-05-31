import requests

resp = requests.post("http://192.168.192.239:5000/predict",
                     files={"file": open('examples/Cat.jpg','rb')})

print(resp.json())