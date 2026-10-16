from typing import List
from backend.app.investigation.schemas import EvidenceGraph, GraphNode, GraphEdge

class GraphBuilder:
    @staticmethod
    def build_graph(artifacts: dict) -> EvidenceGraph:
        nodes = []
        edges = []
        
        # Primary APK node
        nodes.append(GraphNode(id="apk", type="apk", label="Target APK"))
        
        # Add permission nodes and edges
        manifest = artifacts.get("manifest", {})
        permissions = manifest.get("permissions", [])
        for perm in permissions[:5]:  # Limit to 5 for layout readability
            perm_id = f"perm_{perm.split('.')[-1]}"
            nodes.append(GraphNode(id=perm_id, type="permission", label=perm.split('.')[-1]))
            edges.append(GraphEdge(source="apk", target=perm_id, type="REQUESTS"))
            
        # Add network nodes and edges
        network = artifacts.get("network", {})
        for session in network.get("http_sessions", []):
            url = session.get("url", "")
            domain = url.split("//")[-1].split("/")[0] if "//" in url else url
            domain_id = f"dom_{domain}"
            
            nodes.append(GraphNode(id=domain_id, type="domain", label=domain))
            edges.append(GraphEdge(source="apk", target=domain_id, type="CONNECTS_TO"))
            
        # Add IOC nodes and edges
        ioc = artifacts.get("ioc", {})
        for item in ioc.get("iocs", []):
            ioc_id = f"ioc_{item.get('value')}"
            nodes.append(GraphNode(id=ioc_id, type="ioc", label=item.get("value")))
            edges.append(GraphEdge(source="apk", target=ioc_id, type="USES"))
            
        return EvidenceGraph(nodes=nodes, edges=edges)
