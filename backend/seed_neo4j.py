import os
from backend.app.services.graph_service import CampaignGraph

def seed_graph():
    # Provide dummy credentials for testing/seeding without full environment
    os.environ.setdefault("NEO4J_URL", "bolt://localhost:7687")
    os.environ.setdefault("NEO4J_USER", "neo4j")
    if "NEO4J_PASSWORD" not in os.environ:
        raise ValueError("NEO4J_PASSWORD environment variable must be set to run this script.")
    
    graph = CampaignGraph()
    print("Seeding synthetic campaign cases...")

    # Shared cert for campaign 1
    shared_cert_1 = "d9:a4:23:0f:72:6c:ab:5e:39:8a:c6:b1:f7:19:dc:01"
    # Shared C2 for campaign 2
    shared_c2_1 = "malicious-c2.com"
    
    # 1. Base demo APK (the one we're analyzing live)
    graph.upsert_apk_case(
        case_id="demo_case",
        cert_fingerprint=shared_cert_1,
        c2_domains=[shared_c2_1, "legit-api.com"],
        ips=["185.220.101.5"]
    )
    
    # 2. Synthetic Case A (shares cert with demo)
    graph.upsert_apk_case(
        case_id="synth_case_a_cert_reuse",
        cert_fingerprint=shared_cert_1,
        c2_domains=["different-c2.net"],
        ips=["192.168.1.100"]
    )
    
    # 3. Synthetic Case B (shares C2 with demo)
    graph.upsert_apk_case(
        case_id="synth_case_b_c2_reuse",
        cert_fingerprint="aa:bb:cc:dd:ee:ff:11:22:33:44:55:66",
        c2_domains=[shared_c2_1],
        ips=["10.0.0.5"]
    )
    
    # 4. Synthetic Case C (shares both with another case, but not demo)
    graph.upsert_apk_case(
        case_id="synth_case_c_unrelated",
        cert_fingerprint="ff:ff:ff:ff:ff:ff",
        c2_domains=["unrelated-c2.org"],
        ips=["8.8.8.8"]
    )

    print("Seed complete. Testing relation query...")
    related = graph.find_related_campaigns("demo_case")
    print(f"Related campaigns to demo_case: {related}")

    graph.close()

if __name__ == "__main__":
    try:
        seed_graph()
    except Exception as e:
        print(f"Graph seeding failed (Neo4j might not be running locally, which is fine for script creation): {e}")
