import socket
import random

def receive_image_dynamic(server_ip, server_port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind((server_ip, server_port))

        server_socket.listen(60)
        print("Server listening")
        while True:
            conn, addr = server_socket.accept()
            
            with conn:
                print(f"Connected by {addr}")
                file_name = "/home/nabeel/received_images/received_image.jpg"
                with open(file_name, 'wb') as image_file:
                    print("with open(save_path")
                    while True:
                        data = conn.recv(1024)
                        if not data:
                            break
                        print("image_file.write( Data")
                        #print(data)
                        image_file.write(data)

                        print("image_file.write(")
                print("Image received successfully.")
            print(f"Connection concluded")

server_ip = "localhost"
server_port = 65432

# Handler = CustomHandler
print("start receiving images")
receive_image_dynamic('127.0.0.1',65432)
print("end receiving images")
