import { requestLocation } from '../services/locationService';

export const LocationRequester = () => {
    const { user, updateUser } = useAuth();

    useEffect(() => {
        if (!user) return;

        // If location is already set, don't ask again
        if (user.location && user.state) return;

        const handleRequestLocation = async () => {
            try {
                const { city, state } = await requestLocation();
                if (city || state) {
                    // Update user profile via API
                    await fetch('/api/profile/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ location: city, state: state })
                    });

                    // Update local auth context
                    updateUser({ ...user, location: city, state: state });
                    console.log('📍 Location updated successfully');
                }
            } catch (err) {
                console.error("Geocoding failed", err);
            }
        };

        handleRequestLocation();
    }, [user, updateUser]);

    return null; // Invisible component
};
