import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// This points to your public/fonts folder
Font.register({
    family: 'Inter',
    fonts: [
        {
            src: '/fonts/Inter-Regular.ttf'
        },
        {
            src: '/fonts/Inter-Bold.ttf',
            fontWeight: 700
        },
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Inter',
        fontSize: 10,
        color: '#0f172a'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#0f172a',
        borderBottomStyle: 'solid',
        paddingBottom: 20,
        marginBottom: 30
    },
    brand: {
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: -1,
        textTransform: 'uppercase'
    },
    meta: {
        textAlign: 'right'
    },
    grid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 30
    },
    col: {
        flex: 1
    },
    section: {
        marginBottom: 20
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
        borderStyle: 'solid',
        borderColor: '#e2e8f0'
    },
    descriptionText: {
        fontSize: 10,
        lineHeight: 1.5,
        color: '#334155'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        borderTopStyle: 'solid',
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
                    <Text style={styles.brand}>MAKINA</Text>
                    <Text style={{ fontSize: 8, color: '#3b82f6', fontWeight: 700 }}>
                        AUTO SERVIS I DIJAGNOSTIKA
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
                </View>
            </View>

            {order.notes_from_worker && (
                <View style={styles.section}>
                    <Text style={styles.label}>Napomena Mehaničara</Text>
                    <Text style={styles.descriptionText}>
                        {order.notes_from_worker}
                    </Text>
                </View>
            )}

            <View style={{ marginTop: 60, flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: 180, borderTopWidth: 1, borderTopColor: '#000', borderTopStyle: 'solid', paddingTop: 8 }}>
                    <Text style={styles.label}>Potpis servisa (M.P.)</Text>
                </View>
                <View style={{ width: 180, borderTopWidth: 1, borderTopColor: '#000', borderTopStyle: 'solid', paddingTop: 8 }}>
                    <Text style={styles.label}>Potpis klijenta</Text>
                </View>
            </View>

            <Text style={styles.footer}>MAKINA Auto Servis | Zagreb, Hrvatska | Hvala na povjerenju!</Text>
        </Page>
    </Document>
);