import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Inter',
    fonts: [
        { src: '/fonts/Inter-Regular.ttf' },
        { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Inter',
        fontSize: 10,
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#0f172a',
        paddingBottom: 20,
        marginBottom: 30
    },
    brand: {
        fontSize: 24,
        fontWeight: 700,
        textTransform: 'uppercase'
    },
    meta: {
        textAlign: 'right'
    },
    grid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20
    },
    col: {
        flex: 1
    },
    section: {
        marginBottom: 10,
        flex: 1, // This allows the section to expand
        display: 'flex',
        flexDirection: 'column'
    },
    label: {
        fontSize: 8,
        fontWeight: 700,
        textTransform: 'uppercase',
        color: '#64748b',
        marginBottom: 4
    },
    value: {
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase'
    },
    descriptionBox: {
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        flex: 1, // Grows to fill the section
        display: 'flex',
        flexDirection: 'column'
    },
    descriptionText: {
        fontSize: 10,
        lineHeight: 1.5,
        color: '#334155',
        marginBottom: 10 
    },
    inputBox: {
        flex: 1, // Instead of minHeight: 300, it now fills exactly the remaining space
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#cbd5e1',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#ffffff',
    },
    signatureContainer: {
        marginTop: 20,
        marginBottom: 40,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8'
    }
});

export const OrderPDF = ({ order }: any) => (
    <Document title={`Nalog-${order.vehicles.registration}`}>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.brand}>MAKI</Text>
                    <Text style={{ fontSize: 8, color: '#3b82f6', fontWeight: 700 }}>
                        OBRT ZA AUTOMEHANIČARSKE USLUGE
                    </Text>
                </View>
                <View style={styles.meta}>
                    <Text style={styles.label}>Radni Nalog</Text>
                    <Text style={{ fontSize: 16, fontWeight: 700 }}>#{order.id}</Text>
                    <Text style={{ fontSize: 8 }}>
                        Datum: {new Date(order.time_of_creation).toLocaleDateString('hr-HR')}
                    </Text>
                </View>
            </View>

            <View style={styles.grid}>
                <View style={styles.col}>
                    <Text style={styles.label}>Vozilo</Text>
                    <Text style={[styles.value, { color: '#3b82f6', fontSize: 14 }]}>
                        {order.vehicles.registration}
                    </Text>
                    <Text style={styles.value}>{order.vehicles.make} {order.vehicles.model}</Text>
                    <Text style={{ fontSize: 9, marginTop: 4 }}>
                        KM: {order.distance?.toLocaleString()} km
                    </Text>
                </View>
                <View style={styles.col}>
                    <Text style={styles.label}>Klijent</Text>
                    <Text style={styles.value}>
                        {order.vehicles.clients.name} {order.vehicles.clients.surname}
                    </Text>
                    <Text style={{ fontSize: 9, marginTop: 4 }}>
                        Mob: {order.vehicles.clients.phone_number}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Opis Zahvata i Bilješke</Text>
                <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>{order.description || 'Nema opisa.'}</Text>
                    <View style={styles.inputBox}>
                        <Text style={[styles.label, {color: '#94a3b8'}]}>Napomene klijenta / Dodatne usluge / Opis radova</Text>
                    </View>
                </View>
            </View>

            <View style={styles.signatureContainer}>
                <View style={{ width: 250, borderTopWidth: 1, borderTopColor: '#000', paddingTop: 8, textAlign: 'center' }}>
                    <Text style={styles.label}>Potpis servisa</Text>
                </View>
            </View>

            <Text style={styles.footer}>MAKI | Zadar, Hrvatska | Hvala na povjerenju!</Text>
        </Page>
    </Document>
);