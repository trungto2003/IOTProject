import cv2
import numpy as np
import os
import subprocess

def detect_static_regions(frame1, frame2, threshold=30):
    """Detect static regions by comparing the difference between two frames."""
    diff = cv2.absdiff(frame1, frame2)
    gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)
    static_mask = cv2.dilate(thresh, None, iterations=2)
    return static_mask

def calculate_psnr(original_frame, embedded_frame):
    """Calculate PSNR between two frames."""
    mse = np.mean((original_frame - embedded_frame) ** 2)
    if mse == 0:
        return 100
    return 20 * np.log10(255.0 / np.sqrt(mse))

def embed_message(input_video, output_video, encoded_message):
    print("Starting message embedding...")
    print(f"Hamming encoded binary string: {encoded_message} ({len(encoded_message)} bits)")

    with open("video_info.txt", "r") as f:
        lines = f.read().splitlines()
        fps = float(lines[0])
        total_frames = int(lines[1])
        width = int(lines[2])
        height = int(lines[3])

    if total_frames != 315:
        print(f"Error: Video has {total_frames} frames, expected 315 frames.")
        return False, None, None

    cap = cv2.VideoCapture(input_video)
    os.makedirs('frames', exist_ok=True)
    frame_files = []
    bit_index = 0
    bits_embedded = 0
    embedded_frames = []
    prev_frame = None
    original_frames = []

    for i in range(total_frames):
        ret, frame = cap.read()
        if not ret:
            print(f"Error: Could not read frame {i+1}")
            cap.release()
            return False, None, None

        original_frame = frame.copy()
        original_frames.append(original_frame)  # Only keep in RAM, not saving to file

        frame_file = f'frames/frame_{i+1:04d}.png'
        cv2.imwrite(frame_file, frame)
        frame_files.append(frame_file)

        qp_value = 28
        if bit_index < len(encoded_message) and prev_frame is not None:
            static_mask = detect_static_regions(prev_frame, frame)
            if np.sum(static_mask) > 0:
                bit = encoded_message[bit_index]
                qp_value = 28 if bit == '1' else 40
                bits_embedded += 1
                print(f"Frame {i+1}: Embedded bit {bit} (QP: {qp_value}) into static region")
                bit_index += 1
                embedded_frames.append(i)
            else:
                print(f"Frame {i+1}: No static region, skipping embedding")

        cmd = [
            'ffmpeg', '-y', '-i', frame_file, '-c:v', 'libx264',
            '-qp', str(qp_value), '-s', f'{width}x{height}', '-frames:v', '1',
            f'temp_frame_{i+1:04d}.mp4'
        ]
        try:
            subprocess.run(cmd, capture_output=True, text=True, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Frame {i+1}: FFmpeg error: {e.stderr}")
            cap.release()
            return False, None, None

        prev_frame = frame.copy()

    cap.release()

    try:
        with open('file_list.txt', 'w') as f:
            for i in range(total_frames):
                temp_file = f'temp_frame_{i+1:04d}.mp4'
                if os.path.exists(temp_file):
                    f.write(f"file '{temp_file}'\n")
        cmd = [
            'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', 'file_list.txt',
            '-c:v', 'libx264', '-qp', '20', '-r', str(fps), '-s', f'{width}x{height}', output_video
        ]
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"Created {output_video} with {bits_embedded} bits embedded")
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error during video concatenation: {e.stderr}")
        return False, None, None

    input_size = os.path.getsize(input_video) / (1024 * 1024)
    output_size = os.path.getsize(output_video) / (1024 * 1024)
    size_diff = abs(input_size - output_size)
    print(f"Input file size: {input_size:.2f} MB")
    print(f"Output file size: {output_size:.2f} MB")
    print(f"Size difference: {size_diff:.2f} MB")
    if size_diff < 1.0:
        print("Size check passed: Difference less than 1MB.")
    else:
        print("Size check failed: Difference greater than or equal to 1MB.")

    psnr_values = []
    for i in embedded_frames:
        original_frame = original_frames[i]
        cmd = [
            'ffmpeg', '-y', '-i', output_video, '-vf', f'select=eq(n\\,{i})',
            '-q:v', '2', '-frames:v', '1', f'temp_frame_{i+1:04d}.png'
        ]
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        embedded_frame = cv2.imread(f'temp_frame_{i+1:04d}.png')
        if embedded_frame is not None:
            psnr = calculate_psnr(original_frame, embedded_frame)
            psnr_values.append(psnr)
            print(f"Frame {i+1}: PSNR = {psnr:.2f} dB")
        os.remove(f'temp_frame_{i+1:04d}.png')

    if psnr_values:
        avg_psnr = sum(psnr_values) / len(psnr_values)
        print(f"Average PSNR: {avg_psnr:.2f} dB")
        if avg_psnr > 30.0:
            print("PSNR check passed: Average PSNR greater than 30 dB.")
        else:
            print("PSNR check failed: Average PSNR less than or equal to 30 dB.")
    else:
        print("PSNR check failed: Unable to calculate PSNR.")

    for frame_file in frame_files:
        os.remove(frame_file)
    for i in range(total_frames):
        temp_file = f'temp_frame_{i+1:04d}.mp4'
        if os.path.exists(temp_file):
            os.remove(temp_file)
    os.remove('file_list.txt')
    os.rmdir('frames')
    print("Step 3 completed: Message embedding successful.")
    with open("embedded_frames.txt", "w") as f:
        f.write("\n".join(map(str, embedded_frames)))
    return True, total_frames, embedded_frames

if __name__ == "__main__":
    input_video = "input.mp4"
    output_video = "output.mp4"
    with open("encoded_message.txt", "r") as f:
        encoded_message = f.read().strip()
    success, total_frames, embedded_frames = embed_message(input_video, output_video, encoded_message)
    if success:
        print("Message embedding successful.")
    else:
        print("Message embedding failed.")
