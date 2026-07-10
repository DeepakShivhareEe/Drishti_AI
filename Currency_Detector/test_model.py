from engine import CurrencyAnalyzer

def test():
    # Example usage script
    # To run this, place an image named 'test.jpg' in the same directory
    analyzer = CurrencyAnalyzer()
    try:
        with open("test.jpg", "rb") as f:
            image_bytes = f.read()
            
        result = analyzer.analyze(image_bytes)
        print("Analysis Result:")
        print(result)
    except FileNotFoundError:
        print("Please place a 'test.jpg' file in this folder to test the standalone module.")

if __name__ == "__main__":
    test()
