export const requestLocation = (): Promise<{ latitude: number; longitude: number; city: string; state: string }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported by this browser'));
        } else {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
                        const state = data.address.state || '';
                        resolve({ latitude, longitude, city, state });
                    } catch (error) {
                        console.error('Reverse geocoding failed:', error);
                        // Still resolve with coords even if geocoding fails
                        resolve({ latitude, longitude, city: '', state: '' });
                    }
                },
                (error) => reject(error),
                { timeout: 10000 }
            );
        }
    });
};
